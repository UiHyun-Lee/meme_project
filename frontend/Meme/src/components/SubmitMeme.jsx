import React, { useState, useEffect } from 'react'
import PhotoEditor from './PhotoEditor'
import html2canvas from 'html2canvas'
import { uploadMeme, getCurrentTopic } from '../api'
import { ensureLogin } from "../utils/login";
import Typewriter from "./Typewriter";
import FadeInSection from "./FadeInSection";

const SubmitMeme = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );

  const [currentTopic, setCurrentTopic] = useState(null);
  const [topicLoading, setTopicLoading] = useState(true);


  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const res = await getCurrentTopic();
+       setCurrentTopic(res.data);
      } catch (e) {
        console.error("Failed to fetch weekly topic:", e);
      } finally {
        setTopicLoading(false);
      }
    };

    fetchTopic();
  }, []);

  useEffect(() => {
    const handleLoginSuccess = () => {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    };

    window.addEventListener("googleLoginSuccess", handleLoginSuccess);
    return () => {
      window.removeEventListener("googleLoginSuccess", handleLoginSuccess);
    };
  }, []);

  const handleStartEditor = async () => {
    const ok = await ensureLogin();
    if (ok) {
      setIsLoggedIn(true);
    }
  };

  const handleMemeCreate = async () => {
    try {
      setUploading(true);

      const container = document.getElementById('imgContainer');
      if (!container) return alert('Meme container not found!');

      const imgs = container.getElementsByTagName('img');
      await Promise.all(
        Array.from(imgs).map(img => {
          if (!img.complete)
            return new Promise(res => {
              img.onload = res;
              img.onerror = res;
            });
        })
      );

      const canvas = await html2canvas(container, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: 2,
        logging: true,
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const blob = await (await fetch(dataUrl)).blob();
      const form = new FormData();

      form.append('image_file', new File([blob], 'meme.jpg', { type: 'image/jpeg' }));
      form.append('caption', 'User created meme');
      form.append('created_by', 'human');
      form.append('template_id', selectedTemplate?.id);
      form.append('format', selectedTemplate?.description || 'macro');
      form.append('topic', currentTopic?.name || 'Unknown');

      const res = await uploadMeme(form);
      setUploadedUrl(res.data.image);

      alert('Upload Success!');
    } catch (err) {
      console.error('UPLOAD ERROR:', err.response?.data || err.message || err);
      alert('Upload failed!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      textAlign: 'center',
      marginBottom: '30px',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '12px',
      color: 'white'
    }}>
      {/* Title */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          marginBottom: '10px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          <Typewriter text="Submit Your Meme" speed={50} delayBeforeStart={0} />
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '8px', opacity: 0.9 }}>
          <Typewriter text="Create a Meme. Challenge the Machines." speed={50} delayBeforeStart={1000}/>
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: '8px', opacity: 0.9 }}>
           <Typewriter text="Use our photo editor to create your meme and join the competition!" speed={50} delayBeforeStart={2000}/>  <span className="cursor">|</span>
        </p>
        <div className="submit-container">
<p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', textAlign: 'center'}}>
  This week's topic:{' '}
  <strong style={{ color: '#ffeb3b' }}>
    {topicLoading ? 'Loading...' : (currentTopic.name || 'Unknown')}
  </strong>
</p>
        </div>
      </div>

      {/* login x */}
      {!isLoggedIn && (
        <button
          onClick={handleStartEditor}
          style={{
            padding: "12px 24px",
            background: "#4f46e5",
            color: "white",
            borderRadius: 6,
            fontSize: "18px",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          Start Meme Editor
        </button>
      )}

      {/* 로그인 O → 에디터 렌더링 */}
      {isLoggedIn && (
        <PhotoEditor
          onMemeCreate={handleMemeCreate}
          onTemplateSelect={setSelectedTemplate}
        />
      )}

      {/* Upload status */}
      {uploading && (
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{
            color: '#4f46e5',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            marginBottom: '10px'
          }}>
            Uploading... please wait ⏳
          </h3>
          <p style={{ color: '#666' }}>Your meme is being processed and uploaded.</p>
        </div>
      )}

      {/* Upload result */}
      {uploadedUrl && (
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333',
            borderBottom: '2px solid #4f46e5',
            paddingBottom: '10px'
          }}>
            Uploaded Successfully 🎉
          </h3>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <img
              src={uploadedUrl}
              alt="Uploaded Meme"
              style={{
                width: '300px',
                height: 'auto',
                borderRadius: '8px',
                objectFit: 'cover',
                marginBottom: '10px'
              }}
            />
            <p style={{
              fontSize: '0.95rem',
              color: '#555',
              margin: 0
            }}>
              Meme uploaded successfully to the server.
            </p>
            <small style={{ color: '#999' }}>
              {new Date().toLocaleString()}
            </small>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        textAlign: 'left',
        marginBottom: '30px',
        padding: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>

      <FadeInSection delay={0.4}>

        <h4 style={{ fontSize: '1.5rem', color: 'white', marginBottom: '15px', fontWeight: 900 }}>How to create your meme:</h4>
        <ol style={{
          color: 'white',
          lineHeight: '2.5',
          paddingLeft: '22px',
          fontSize: '1.05rem',
          fontWeight: 600
        }}>
          <li>Choose a template from the selection above</li>
          <li>Add text elements and customize their style</li>
          <li>Drag text elements to position them perfectly</li>
          <li>Double-click text to edit, right-click to delete</li>
          <li>Download your meme or submit it to the database</li>
        </ol>
      </FadeInSection>

      </div>

  <footer className="site-footer">
        <div className="footer-links">
          <a
            href="https://www.tu-darmstadt.de/impressum/index.de.jsp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Impressum
          </a>
          <span className="footer-separator">|</span>
          <a
            href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
};

export default SubmitMeme;
