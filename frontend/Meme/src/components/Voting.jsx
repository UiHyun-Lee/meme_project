// import React, { useEffect, useState } from 'react'
// import { getRandomMemes, voteMeme, getCurrentTopic  } from '../api'
// import CookieBanner from "./CookieBanner";
//
// const Voting = () => {
//   const [memes, setMemes] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [message, setMessage] = useState('')
//   const [activeIndex, setActiveIndex] = useState(0)   //  mobile slider
//   const [cookieConsent, setCookieConsent] = useState(
//     localStorage.getItem("cookieConsent")
//   );
//   const [currentTopic, setCurrentTopic] = useState(null)
//
//   // Debug log
//   useEffect(() => {
//     console.log("MEMES FROM API:", memes)
//   }, [memes])
//
//   const handleAcceptCookies = () => {
//     localStorage.setItem("cookieConsent", "all");
//     setCookieConsent("all");
//   };
//
//   const handleRejectCookies = () => {
//     localStorage.setItem("cookieConsent", "necessary");
//     setCookieConsent("necessary");
//   };
//
//   const fetchCurrentTopic = async () => {
//   try {
//     const res = await getCurrentTopic()
//     if (res.data && res.data.name) {
//       setCurrentTopic(res.data)
//     } else {
//       setCurrentTopic(null)
//     }
//   } catch (err) {
//     console.error("CURRENT TOPIC ERROR:", err.response?.data || err.message)
//     setCurrentTopic(null)
//   }
// }
//
//   useEffect(() => {
//       fetchCurrentTopic()
//     fetchMemes()
//   }, [])
//
//   const fetchMemes = async () => {
//     try {
//       setLoading(true)
//       const res = await getRandomMemes()
//       let memesData = res.data
//
//       //  AI/Human randomly
//       if (memesData.length === 2) {
//         const [m1, m2] = memesData
//         if (m1.created_by !== m2.created_by && Math.random() < 0.5) {
//           memesData = [m2, m1]
//         }
//       }
//
//       setMemes(memesData)
//       setActiveIndex(0)
//     } catch (err) {
//       console.error("FETCH ERROR:", err.response?.data || err.message)
//       setMessage("Not enough Memes now! 😢")
//     } finally {
//       setLoading(false)
//     }
//   }
//
//   const handleVote = async (memeId) => {
//     try {
//       await voteMeme(memeId)
//       setMessage("Thanks! Your vote was counted.")
//     } catch (err) {
//       console.error("Vote error:", err)
//       setMessage("Vote failed 😢")
//     } finally {
//       setTimeout(() => {
//         setMessage('')
//         fetchMemes()
//       }, 800)
//     }
//   }
//
//   const reportMeme = (memeId) => {
//     alert("Thanks for reporting! We will check it.")
//   }
//
//   if (loading) return <p>Loading memes...</p>
//   if (memes.length < 2) return <p>{message || "Not enough Memes now! 😢"}</p>
//
//   const lastIndex = memes.length - 1
//
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         width: "100%",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         background: "linear-gradient(135deg, #667eea, #764ba2)",
//         color: "white",
//         paddingBottom: "60px",
//         overflowX: "hidden",
//         textAlign: "center",
//       }}
//     >
//       {/* TOPIC */}
// <p className="topic-text">
//   This week's topic:{" "}
//   <span style={{ color: "#fff176" }}>
//     {currentTopic?.name || "No active topic"}
//   </span>
// </p>
//
//       {/* ⭐ DESKTOP VERSION — ORIGINAL 2 memes side-by-side */}
//       <div className="desktop-meme-comparison meme-comparison">
//         {memes.slice(0, 2).map((meme, index) => (
//           <React.Fragment key={meme.id}>
//             <div className="meme-card" onClick={() => handleVote(meme.id)}>
//               <img
//                 src={meme.image_url}
//                 alt={"Meme " + index}
//                 style={{ maxWidth: 350, borderRadius: 12 }}
//               />
//               <button
//                 className="report-button"
//                 onClick={(e) => {
//                   e.stopPropagation()
//                   reportMeme(meme.id)
//                 }}
//               >
//                 🚫 Melden
//               </button>
//             </div>
//
//             {index === 0 && <div className="vs-text">VS</div>}
//           </React.Fragment>
//         ))}
//       </div>
//
//       {/* ⭐ MOBILE VERSION — SLIDER (from your test code) */}
//       <div className="mobile-meme-slider">
//         {/* LEFT ARROW */}
//         <button
//           className="slider-arrow slider-arrow-left"
//           onClick={() => setActiveIndex(prev => Math.max(0, prev - 1))}
//           style={{
//             opacity: activeIndex === 0 ? 0 : 1,
//             visibility: activeIndex === 0 ? "hidden" : "visible",
//           }}
//         >
//           ‹
//         </button>
//
//         <div className="slider-viewport">
//           <div className="slider-track" style={{
//                         width: `${memes.length * 50}%`,
//                         transform: `translateX(-${activeIndex * 80}%)`
//                   }}>
//   {memes.map((meme, index) => {
//     return (
//       <React.Fragment key={meme.id}>
//         <div
//           className="meme-card slider-card"
//           onClick={() => handleVote(meme.id)}
//         >
//           <img src={meme.image_url} className="slider-image" />
//
//           <button
//             className="report-button"
//             onClick={(e) => {
//               e.stopPropagation();
//               reportMeme(meme.id);
//             }}
//           >
//             🚫 Melden
//           </button>
//         </div>
//
//         {index === 0 && <div className="vs-text">VS</div>}
//       </React.Fragment>
//     )
//   })}
// </div>
//         </div>
//
//         {/* RIGHT ARROW */}
//         <button
//           className="slider-arrow slider-arrow-right"
//           onClick={() => setActiveIndex(prev => Math.min(lastIndex, prev + 1))}
//           style={{
//             opacity: activeIndex === lastIndex ? 0 : 1,
//             visibility: activeIndex === lastIndex ? "hidden" : "visible",
//           }}
//         >
//           ›
//         </button>
//       </div>
//
//       {/* FEEDBACK */}
//       {message && (
//         <div className="vote-feedback" style={{ marginTop: 16 }}>
//           {message}
//         </div>
//       )}
//
//       {/* FOOTER */}
//       <footer className="site-footer">
//         <div className="footer-links">
//           <a href="https://www.tu-darmstadt.de/impressum/index.de.jsp" target="_blank">Impressum</a>
//           <span className="footer-separator">|</span>
//           <a href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp" target="_blank">
//             Privacy
//           </a>
//         </div>
//       </footer>
//
//       {/* COOKIE BANNER */}
//       {!cookieConsent && (
//         <CookieBanner
//           onAccept={handleAcceptCookies}
//           onReject={handleRejectCookies}
//         />
//       )}
//     </div>
//   )
// }
//
// export default Voting


import React, { useEffect, useState } from "react";
import { getRandomMemes, voteMeme, getCurrentTopic } from "../api";
import CookieBanner from "./CookieBanner";

const Voting = () => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [activeIndex, setActiveIndex] = useState(0); // mobile slider
  const [currentTopic, setCurrentTopic] = useState(null);
  const [cookieConsent, setCookieConsent] = useState(null);
  const [seenFirst, setSeenFirst] = useState(false);
  const [seenSecond, setSeenSecond] = useState(false);

  // Debug
  useEffect(() => {
    console.log("MEMES FROM API:", memes);
  }, [memes]);

  useEffect(() => {
    console.log("COOKIE CONSENT:", cookieConsent);
  }, [cookieConsent]);

  // 첫 마운트 시 localStorage에서 불러오기 (있으면 적용)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("cookieConsent");
    if (stored === "all" || stored === "necessary") {
      setCookieConsent(stored);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem("cookieConsent", "all");
    setCookieConsent("all");
  };

  const handleRejectCookies = () => {
    localStorage.setItem("cookieConsent", "necessary");
    setCookieConsent("necessary");
  };

  const fetchCurrentTopic = async () => {
    try {
      const res = await getCurrentTopic();
      if (res.data && res.data.name) {
        setCurrentTopic(res.data);
      } else {
        setCurrentTopic(null);
      }
    } catch (err) {
      console.error("CURRENT TOPIC ERROR:", err.response?.data || err.message);
      setCurrentTopic(null);
    }
  };

  useEffect(() => {
    fetchCurrentTopic();
    fetchMemes();
  }, []);

  const fetchMemes = async () => {
    try {
      setLoading(true);
      const res = await getRandomMemes();
      let memesData = res.data;

      // (선택) human/ai 순서 swap - 기존 로직 유지
      if (memesData.length === 2) {
        const [m1, m2] = memesData;
        if (m1.created_by !== m2.created_by && Math.random() < 0.5) {
          memesData = [m2, m1];
        }
      }

      setMemes(memesData);
      setActiveIndex(0);

      // 새 페어 로딩 시 "본 상태" 초기화
      if (memesData.length >= 2) {
        const isMobile =
          typeof window !== "undefined" ? window.innerWidth < 768 : false;
        if (isMobile) {
          setSeenFirst(true); // 첫 번째는 바로 보임
          setSeenSecond(false);
        } else {
          setSeenFirst(true);
          setSeenSecond(true); // 데스크톱은 둘 다 보여서 true
        }
      } else {
        setSeenFirst(false);
        setSeenSecond(false);
      }
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
      setMessage("Not enough Memes now! 😢");
    } finally {
      setLoading(false);
    }
  };

  // 모바일 슬라이더에서 어느 카드까지 봤는지 기록
  useEffect(() => {
    if (memes.length < 2) return;
    if (activeIndex === 0) setSeenFirst(true);
    if (activeIndex === 1) setSeenSecond(true);
  }, [activeIndex, memes.length]);

  // 쿠키 동의 여부에 따라 스크롤 잠그기
  useEffect(() => {
    const isLocked = !cookieConsent; // null일 때 잠김
    if (isLocked) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, [cookieConsent]);

  const handleVote = async (winnerId) => {
    // 1) 쿠키 선택 전이면 투표 막기
    if (!cookieConsent) {
      setMessage("Please accept cookies before voting.");
      return;
    }

    if (memes.length < 2) return;

    const isMobile =
      typeof window !== "undefined" ? window.innerWidth < 768 : false;
    const hasSeenBoth = !isMobile || (seenFirst && seenSecond);

    // 2) 모바일: 두 밈 다 안 봤으면 투표 막기
    if (!hasSeenBoth) {
      setMessage("Please view both memes before voting.");
      return;
    }

    const [m0, m1] = memes;
    const loserId = winnerId === m0.id ? m1.id : m0.id;

    try {
      // ✅ 백엔드가 winner_id, loser_id 를 기대하므로 이렇게 호출
      const res = await voteMeme(winnerId, loserId);
      console.log("VOTE RESPONSE:", res.data);
      setMessage("Thanks! Your vote was counted.");
    } catch (err) {
      console.error(
        "Vote error:",
        err.response?.status,
        err.response?.data || err.message
      );
      setMessage("Vote failed 😢");
    } finally {
      setTimeout(() => {
        setMessage("");
        fetchMemes();
      }, 800);
    }
  };

  const reportMeme = (memeId) => {
    if (!cookieConsent) {
      setMessage("Please accept cookies before interacting.");
      return;
    }
    alert("Thanks for reporting! We will check it.");
    // 필요하면 여기서 report_meme API 호출
  };

  if (loading) return <p>Loading memes...</p>;
  if (memes.length < 2) return <p>{message || "Not enough Memes now! 😢"}</p>;

  const lastIndex = memes.length - 1;

  const isLocked = !cookieConsent; // blur + 차단 조건

  return (
    <div
      className="voting-wrapper"
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* 실제 콘텐츠 */}
      <div
        className="voting-content"
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "white",
          paddingBottom: "60px",
          textAlign: "center",
          pointerEvents: isLocked ? "none" : "auto", // 🔒 상호작용 막기
        }}
      >
        {/* TOPIC */}
        <p className="topic-text">
          This week's topic:{" "}
          <span style={{ color: "#fff176" }}>
            {currentTopic?.name || "No active topic"}
          </span>
        </p>

        {/* DESKTOP VERSION — 두 밈 나란히 */}
        <div className="desktop-meme-comparison meme-comparison">
          {memes.slice(0, 2).map((meme, index) => (
            <React.Fragment key={meme.id}>
              <div className="meme-card" onClick={() => handleVote(meme.id)}>
                <img
                  src={meme.image_url}
                  alt={"Meme " + index}
                  style={{ maxWidth: 350, borderRadius: 12 }}
                />
                <button
                  className="report-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    reportMeme(meme.id);
                  }}
                >
                  🚫 Melden
                </button>
              </div>

              {index === 0 && <div className="vs-text">VS</div>}
            </React.Fragment>
          ))}
        </div>

        {/* MOBILE VERSION — 슬라이더 */}
        <div className="mobile-meme-slider">
          {/* LEFT ARROW */}
          <button
            className="slider-arrow slider-arrow-left"
            onClick={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
            style={{
              opacity: activeIndex === 0 ? 0 : 1,
              visibility: activeIndex === 0 ? "hidden" : "visible",
            }}
          >
            ‹
          </button>

          <div className="slider-viewport">
            <div
              className="slider-track"
              style={{
                width: `${memes.length * 50}%`,
                transform: `translateX(-${activeIndex * 80}%)`,
              }}
            >
              {memes.map((meme, index) => (
                <React.Fragment key={meme.id}>
                  <div
                    className="meme-card slider-card"
                    onClick={() => handleVote(meme.id)}
                  >
                    <img src={meme.image_url} className="slider-image" />

                    <button
                      className="report-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        reportMeme(meme.id);
                      }}
                    >
                      🚫 Melden
                    </button>
                  </div>

                  {index === 0 && <div className="vs-text">VS</div>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* RIGHT ARROW */}
          <button
            className="slider-arrow slider-arrow-right"
            onClick={() =>
              setActiveIndex((prev) => Math.min(lastIndex, prev + 1))
            }
            style={{
              opacity: activeIndex === lastIndex ? 0 : 1,
              visibility: activeIndex === lastIndex ? "hidden" : "visible",
            }}
          >
            ›
          </button>
        </div>

        {/* FEEDBACK */}
        {message && (
          <div className="vote-feedback" style={{ marginTop: 16 }}>
            {message}
          </div>
        )}

        {/* FOOTER */}
        <footer className="site-footer">
          <div className="footer-links">
            <a
              href="https://www.tu-darmstadt.de/impressum/index.de.jsp"
              target="_blank"
              rel="noreferrer"
            >
              Impressum
            </a>
            <span className="footer-separator">|</span>
            <a
              href="https://www.tu-darmstadt.de/datenschutzerklaerung.de.jsp"
              target="_blank"
              rel="noreferrer"
            >
              Privacy
            </a>
          </div>
        </footer>
      </div>

      {/* 🔥 쿠키 선택 전: 전체 화면 블러 & 딤 레이어 */}
      {isLocked && <div className="cookie-blur-overlay" />}

      {/* COOKIE BANNER (항상 클릭 가능해야 하니까 blur 위에 떠야 함) */}
      {!cookieConsent && (
        <div className="cookie-banner-root">
          <CookieBanner
            onAccept={handleAcceptCookies}
            onReject={handleRejectCookies}
          />
        </div>
      )}
    </div>
  );
};

export default Voting;
