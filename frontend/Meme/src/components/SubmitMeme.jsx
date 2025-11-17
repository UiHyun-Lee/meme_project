// import React, { useState, useEffect } from 'react'
// import PhotoEditor from './PhotoEditor'
// import html2canvas from 'html2canvas'
// import { uploadMeme } from '../api'
// import LoginModal from "./LoginModal";
// import { ensureLogin } from "../utils/login";
//
//
// const SubmitMeme = () => {
//   const [uploading, setUploading] = useState(false)
//   const [uploadedUrl, setUploadedUrl] = useState(null)
//   const [selectedTemplate, setSelectedTemplate] = useState(null)
//
//   const [isLoggedIn, setIsLoggedIn] = useState(
//     !!localStorage.getItem("accessToken")
//   );
//   const [showLoginModal, setShowLoginModal] = useState(false);
//
//   // 자동 로그인 모달 열기 이벤트 리스너
//   useEffect(() => {
//     const openLogin = () => setShowLoginModal(true);
//     window.addEventListener("openGoogleLogin", openLogin);
//     return () => window.removeEventListener("openGoogleLogin", openLogin);
//   }, []);
//
//   // PhotoEditor 시작 버튼 눌렀을 때 자동 로그인 체크
//   const handleStartEditor = async () => {
//     const ok = await ensureLogin();
//     if (ok) {
//       setIsLoggedIn(true);
//     }
//   };
//
//   // 밈 생성 기능 (로그인 성공 후 PhotoEditor에서 실행됨)
//   const handleMemeCreate = async () => {
//     try {
//       setUploading(true);
//
//       const container = document.getElementById('imgContainer');
//       if (!container) return alert('Meme container not found!');
//
//       const imgs = container.getElementsByTagName('img');
//       await Promise.all(
//         Array.from(imgs).map(img => {
//           if (!img.complete)
//             return new Promise(res => {
//               img.onload = res;
//               img.onerror = res;
//             });
//         })
//       );
//
//       const canvas = await html2canvas(container, {
//         useCORS: true,
//         allowTaint: true,
//         backgroundColor: null,
//         scale: 2,
//         logging: true,
//       });
//
//       const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
//       const blob = await (await fetch(dataUrl)).blob();
//       const form = new FormData();
//       form.append('image_file', new File([blob], 'meme.jpg', { type: 'image/jpeg' }));
//       form.append('caption', 'User created meme');
//       form.append('created_by', 'human');
//       form.append('template_id', selectedTemplate?.public_id);
//       form.append('topic', selectedTemplate?.category?.name || 'unknown');
//       form.append('format', selectedTemplate?.description || 'macro');
//
//       const topicGuess =
//         selectedTemplate?.public_id?.split('/')?.pop()?.split('_')?.[0] ||
//         'unknown';
//       form.append('topic', topicGuess);
//
//       const res = await uploadMeme(form);
//       setUploadedUrl(res.data.image);
//
//       alert('Cloudinary + DB Upload Success!');
//     } catch (err) {
//       console.error('UPLOAD ERROR:', err.response?.data || err.message || err);
//       alert('Upload failed! Check console.');
//     } finally {
//       setUploading(false);
//     }
//   };
//
//   return (
//     <div style={{
//         textAlign: 'center',
//         marginBottom: '30px',
//         padding: '20px',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         borderRadius: '12px',
//         color: 'white'
//     }}>
//
//       {/* Login Modal */}
//       {showLoginModal && (
//         <LoginModal
//           onSuccess={() => {
//             setIsLoggedIn(true);
//             setShowLoginModal(false);
//           }}
//           onClose={() => setShowLoginModal(false)}
//         />
//       )}
//
//       {/* Title / Intro Section */}
//       <div style={{
//         textAlign: 'center',
//         marginBottom: '30px',
//         padding: '20px',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         borderRadius: '12px',
//         color: 'white'
//       }}>
//         <h2 style={{
//           fontSize: '2.5rem',
//           marginBottom: '10px',
//           textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
//         }}>
//           Submit Your Meme
//         </h2>
//         <p style={{ fontSize: '1.2rem', marginBottom: '8px', opacity: 0.9 }}>
//           Create a Meme. Challenge the Machines.
//         </p>
//         <p style={{ fontSize: '1.1rem', marginBottom: '8px', opacity: 0.9 }}>
//           Use our photo editor to create your meme and join the competition!
//         </p>
//         <div className="submit-container">
//           <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', textAlign: 'center'}}>
//             This week's topic: <strong style={{ color: '#ffeb3b' }}>School</strong>
//           </p>
//         </div>
//       </div>
//
//
//       {/* ✔ 로그인 X → 에디터 감추고 시작 버튼만 보여줌 */}
//       {!isLoggedIn && (
//         <button
//           onClick={handleStartEditor}
//           style={{
//             padding: "12px 24px",
//             background: "#4f46e5",
//             color: "white",
//             borderRadius: 6,
//             fontSize: "18px",
//             cursor: "pointer",
//             marginBottom: "20px",
//           }}
//         >
//           Start Meme Editor
//         </button>
//       )}
//
//       {/* ✔ 로그인 O → 에디터 전체 렌더링 */}
//       {isLoggedIn && (
//         <PhotoEditor
//           onMemeCreate={handleMemeCreate}
//           onTemplateSelect={setSelectedTemplate}
//         />
//       )}
//
//
//       {/* Upload status */}
//       {uploading && (
//         <div style={{
//           marginTop: '40px',
//           padding: '20px',
//           backgroundColor: 'white',
//           borderRadius: '12px',
//           boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//           textAlign: 'center'
//         }}>
//           <h3 style={{
//             color: '#4f46e5',
//             fontWeight: 'bold',
//             fontSize: '1.2rem',
//             marginBottom: '10px'
//           }}>
//             Uploading... please wait ⏳
//           </h3>
//           <p style={{ color: '#666' }}>Your meme is being processed and uploaded.</p>
//         </div>
//       )}
//
//       {/* Upload result */}
//       {uploadedUrl && (
//         <div style={{
//           marginTop: '40px',
//           padding: '20px',
//           backgroundColor: 'white',
//           borderRadius: '12px',
//           boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
//         }}>
//           <h3 style={{
//             textAlign: 'center',
//             marginBottom: '20px',
//             color: '#333',
//             borderBottom: '2px solid #4f46e5',
//             paddingBottom: '10px'
//           }}>
//             Uploaded Successfully 🎉
//           </h3>
//
//           <div style={{
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             flexDirection: 'column',
//             gap: '10px'
//           }}>
//             <img
//               src={uploadedUrl}
//               alt="Uploaded Meme"
//               style={{
//                 width: '300px',
//                 height: 'auto',
//                 borderRadius: '8px',
//                 objectFit: 'cover',
//                 marginBottom: '10px'
//               }}
//             />
//             <p style={{
//               fontSize: '0.95rem',
//               color: '#555',
//               margin: 0
//             }}>
//               Meme uploaded successfully to the server.
//             </p>
//             <small style={{ color: '#999' }}>
//               {new Date().toLocaleString()}
//             </small>
//           </div>
//         </div>
//       )}
//
//       {/* Instructions */}
//       <div style={{
//         textAlign: 'left',
//         marginBottom: '30px',
//         padding: '20px',
//         background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//         borderRadius: '12px',
//         color: 'white'
//       }}>
//         <h4 style={{ color: '#1a1a1a', marginBottom: '15px' }}>How to create your meme:</h4>
//         <ol style={{
//           color: '#0d1b2a',
//           lineHeight: '1.8',
//           paddingLeft: '22px',
//           fontSize: '1.05rem',
//           fontWeight: 500
//         }}>
//           <li>Choose a template from the selection above</li>
//           <li>Add text elements and customize their style</li>
//           <li>Drag text elements to position them perfectly</li>
//           <li>Double-click text to edit, right-click to delete</li>
//           <li>Download your meme or submit it to the database</li>
//         </ol>
//       </div>
//
//       <footer style={{ marginTop: "40px", padding: "20px", textAlign: "center" }}>
//         <button
//           onClick={() => (window.location.href = '/impressum')}
//           style={{
//             padding: "10px 20px",
//             borderRadius: "8px",
//             border: "none",
//             fontWeight: "bold",
//             backgroundColor: "#ffd700",
//             cursor: "pointer"
//           }}
//         >
//           Impressum
//         </button>
//       </footer>
//     </div>
//   );
// };
//
// export default SubmitMeme;


import React, { useState } from 'react'
import PhotoEditor from './PhotoEditor'
import html2canvas from 'html2canvas'
import { uploadMeme } from '../api'
import { ensureLogin } from "../utils/login";

const SubmitMeme = () => {
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );

  // Start Meme Editor 버튼 눌렀을 때 → ensureLogin만 사용
  const handleStartEditor = async () => {
    const ok = await ensureLogin();      // ❗ 여기서 토큰 없으면 openGoogleLogin 이벤트 날림
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
      form.append('template_id', selectedTemplate?.public_id);
      form.append('topic', selectedTemplate?.category?.name || 'unknown');
      form.append('format', selectedTemplate?.description || 'macro');

      const topicGuess =
        selectedTemplate?.public_id?.split('/')?.pop()?.split('_')?.[0] ||
        'unknown';
      form.append('topic', topicGuess);

      const res = await uploadMeme(form);
      setUploadedUrl(res.data.image);

      alert('Cloudinary + DB Upload Success!');
    } catch (err) {
      console.error('UPLOAD ERROR:', err.response?.data || err.message || err);
      alert('Upload failed! Check console.');
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
          Submit Your Meme
        </h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '8px', opacity: 0.9 }}>
          Create a Meme. Challenge the Machines.
        </p>
        <p style={{ fontSize: '1.1rem', marginBottom: '8px', opacity: 0.9 }}>
          Use our photo editor to create your meme and join the competition!
        </p>
        <div className="submit-container">
          <p style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', textAlign: 'center'}}>
            This week's topic: <strong style={{ color: '#ffeb3b' }}>School</strong>
          </p>
        </div>
      </div>

      {/* 로그인 X → 시작 버튼만 */}
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
        <h4 style={{ color: '#1a1a1a', marginBottom: '15px' }}>How to create your meme:</h4>
        <ol style={{
          color: '#0d1b2a',
          lineHeight: '1.8',
          paddingLeft: '22px',
          fontSize: '1.05rem',
          fontWeight: 500
        }}>
          <li>Choose a template from the selection above</li>
          <li>Add text elements and customize their style</li>
          <li>Drag text elements to position them perfectly</li>
          <li>Double-click text to edit, right-click to delete</li>
          <li>Download your meme or submit it to the database</li>
        </ol>
      </div>

      <footer style={{ marginTop: "40px", padding: "20px", textAlign: "center" }}>
        <button
          onClick={() => (window.location.href = '/impressum')}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            fontWeight: "bold",
            backgroundColor: "#ffd700",
            cursor: "pointer"
          }}
        >
          Impressum
        </button>
      </footer>
    </div>
  );
};

export default SubmitMeme;
