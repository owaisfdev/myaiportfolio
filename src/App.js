import React, { useEffect, useRef, useState } from "react";
import style from './App.module.css';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

const App = () => {
  const baseContext = `
    You are Owais, a Full Stack Web Developer.
    Here is your profile:
    - About: I am Owais Farooq, a dedicated professional with over 6 years of experience in the field of web development. Throughout my career, I have specialized in Frontend Development (HTML, CSS, jQuery, ReactJS, TailwindCSS) and Backend Development (Core PHP, Laravel, WordPress, Shopify). I’ve successfully converted 300+ PSD/XD/Figma designs into functional WordPress and HTML websites and built 100+ websites across various niches including ecommerce and listing platforms. Presently, I manage a wide range of technical responsibilities in WordPress and Laravel, from resolving payment merchant issues (Stripe, PayPal, etc.) to handling website, PHP, server, and hosting challenges. I’m highly adaptable, capable of thriving independently or as part of a team, and known for consistently delivering solutions on time through strong problem-solving and research skills.
    
    - Experience:
      • Senior Web Developer | Digitaez Pvt. Ltd. (Jul 2023 – Present)
        Leading custom WordPress projects, handling backend tasks, page builders (Elementor, WPBakery), and client portals. Managing servers, hosting, and payment integrations.
      • Senior Developer | Flow Digital Pvt. Ltd. (Jan 2022 – Jul 2023)
        Assigned and reviewed tasks for interns/juniors, delivered multiple brand websites, and worked on research-based as well as provided designs.
      • Senior Software Executive | Abtach (Aug 2020 – Dec 2021)
        Converted 100+ PSD designs to WordPress, managed backend and frontend builds, worked on large-scale WordPress portals.
      • Frontend/WordPress Developer | IT Concepts (Aug 2019 – Aug 2020)
        Started as a WordPress intern, received structured training, later promoted to Junior Developer. Worked on frontend + backend WordPress development.
    
    - Projects:
      https://seoshark.nl (SEO services website with animations),
      https://mefitout.com (Home Decor & Design/Build services),
      https://alarabi.law (Criminal Law & Legal Services),
      https://podcastpledge.com (Multi Vendor Donation System with Stripe Split Payments),
      https://theluxurycloset.com (Ecommerce Store),
      https://dreducationconsulting.org (Lead Capturing & Management Portal in Core PHP),
      https://rosesae.com, https://chordcornerae.com, https://walcomech.com, and many more.
    
    - Skills: JavaScript, PHP, React, Laravel, MySQL, HTML5, CSS3, jQuery, WordPress, Shopify, Bootstrap, TailwindCSS, REST APIs, SEO.
    
    - Education: Bachelors in Computer Science, Sir Syed University of Engineering & Technology (3.3 GPA, 2022).
    
    - Contact: owaisfdev@gmail.com, contact@iamowais.com, +923430393998 (WhatsApp, Call), Karachi, Pakistan.
      Always answer as Owais.
`;





  const canvasRef = useRef(null);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false); 
  const [loading, setLoading] = useState(false);
  // Send message
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!input.trim() || loading) return;

  setStarted(true);
  setChat((prev) => [...prev, { type: "formfill", text: input }]);
  setLoading(true);
  setInput(""); // input clear immediately

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Loader push
    setChat((prev) => [
      ...prev,
      { type: "airesponse", text: "typing...", isLoader: true },
    ]);

    const result = await model.generateContent(`${baseContext}\n\nUser: ${input}`);
    const response = result.response.text();

    // Replace loader with actual response
    setChat((prev) => {
      let newChat = [...prev];
      if (newChat[newChat.length - 1]?.isLoader) {
        newChat[newChat.length - 1] = { type: "airesponse", text: response };
      } else {
        newChat.push({ type: "airesponse", text: response });
      }
      return newChat;
    });
  } catch (err) {
    console.error(err);

    // Agar quota exceeded error ho
    if (err.message.includes("429") || err.message.includes("quota")) {
      setChat((prev) => {
        let newChat = [...prev];
        if (newChat[newChat.length - 1]?.isLoader) {
          newChat[newChat.length - 1] = { 
            type: "airesponse", 
            text: "Sorry, The limit has been reached, try again tomorrow."
          };
        } else {
          newChat.push({
            type: "airesponse",
            text: "Sorry, The limit has been reached, try again tomorrow.",
          });
        }
        return newChat;
      });
    } else {
      // generic error
      setChat((prev) => {
        let newChat = [...prev];
        if (newChat[newChat.length - 1]?.isLoader) {
          newChat[newChat.length - 1] = { 
            type: "airesponse", 
            text: "There is some error, please try again." 
          };
        } else {
          newChat.push({ 
            type: "airesponse", 
            text: "There is some error, please try again." 
          });
        }
        return newChat;
      });
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let stars = [];

    // resize handle
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    class Star {
      constructor(x, y, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.finalSize = Math.random() * 2;
        this.size = this.finalSize * 2;
        this.alpha = 1;
        this.velocityX = velocityX * 0.05;
        this.velocityY = 1 + Math.random() + velocityY * 0.05;
        this.gravity = 0.02;
        this.drag = 0.97;
        this.turbulence = () => Math.random() * 0.5 - 0.25;
        this.timeElapsed = 0;
      }

      draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      update(deltaTime) {
        this.x += this.velocityX + this.turbulence();
        this.velocityX *= this.drag;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        this.alpha = Math.max(0, this.alpha - 0.005);

        this.timeElapsed += deltaTime;
        if (this.timeElapsed < 2000) {
          this.size =
            this.finalSize * 2 - (this.finalSize * this.timeElapsed) / 2000;
        } else {
          this.size = this.finalSize;
        }
      }
    }

    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseVelocityX = 0;
    let mouseVelocityY = 0;

    function addStar(e) {
      mouseVelocityX = e.clientX - lastMouseX;
      mouseVelocityY = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      let randomOffsetX = (Math.random() - 0.5) * 100;
      let randomOffsetY = (Math.random() - 0.5) * 100;

      stars.push(
        new Star(
          e.clientX,
          e.clientY,
          mouseVelocityX + randomOffsetX,
          mouseVelocityY + randomOffsetY
        )
      );
    }

    canvas.addEventListener("mousemove", addStar);

    let lastTime = 0;

    function update(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;

      ctx.clearRect(0, 0, width, height);
      stars.forEach((star) => star.update(deltaTime));
      stars.forEach((star) => star.draw());
      stars = stars.filter(
        (star) =>
          star.alpha > 0 && star.y < height && star.x > 0 && star.x < width
      );
      requestAnimationFrame(update);
    }

    update();

    // cleanup on unmount
    return () => {
      canvas.removeEventListener("mousemove", addStar);
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  const handleQuickAsk = async (prompt) => {
  if (loading) return; // ek waqt me ek hi request

  setStarted(true);
  setChat((prev) => [...prev, { type: "formfill", text: prompt }]);
  setLoading(true);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Loader dikhana
    setChat((prev) => [
      ...prev,
      { type: "airesponse", text: "typing...", isLoader: true },
    ]);

    // Actual API call
    const result = await model.generateContent(`${baseContext}\n\nUser: ${prompt}`);
    const response = result.response.text();

    // Loader ko replace karo
    setChat((prev) => {
      let newChat = [...prev];
      if (newChat.length && newChat[newChat.length - 1]?.isLoader) {
        newChat[newChat.length - 1] = { type: "airesponse", text: response };
      } else {
        newChat.push({ type: "airesponse", text: response });
      }
      return newChat;
    });
  } catch (err) {
    console.error("QuickAsk error:", err);

    if (err.message.includes("429") || err.message.includes("quota")) {
      // quota exceeded error
      setChat((prev) => {
        let newChat = [...prev];
        if (newChat.length && newChat[newChat.length - 1]?.isLoader) {
          newChat[newChat.length - 1] = {
            type: "airesponse",
            text: "Sorry, The limit has been exceeded, please try again tomorrow.",
          };
        } else {
          newChat.push({
            type: "airesponse",
            text: "Sorry, The limit has been exceeded, please try again tomorrow.",
          });
        }
        return newChat;
      });
    } else {
      // generic error
      setChat((prev) => {
        let newChat = [...prev];
        if (newChat.length && newChat[newChat.length - 1]?.isLoader) {
          newChat[newChat.length - 1] = {
            type: "airesponse",
            text: "There is some error. Please try again.",
          };
        } else {
          newChat.push({
            type: "airesponse",
            text: "There is some error. Please try again.",
          });
        }
        return newChat;
      });
    }
  } finally {
    setLoading(false);
  }
};


 

  return (
    <div className={`${style.chatbot} ${started ? style.chatStarted : ""}`}>
      <a className={style.downloadcv} href="/owaisfarooq.pdf" download><svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M210.43,41.22l-130.25-23A14,14,0,0,0,64,29.58l-29.75,169a14,14,0,0,0,11.36,16.22l130.25,23h0a13.64,13.64,0,0,0,2.46.22A14,14,0,0,0,192,226.42l29.75-169A14,14,0,0,0,210.43,41.22ZM210,55.36l-29.75,169a2,2,0,0,1-.82,1.3,2,2,0,0,1-1.49.33L47.65,203A2,2,0,0,1,46,200.64l29.75-169a2,2,0,0,1,.82-1.3A2.06,2.06,0,0,1,78.1,30L208.35,53A2,2,0,0,1,210,55.36ZM186.11,75.51a6,6,0,0,1-5.9,5,6.2,6.2,0,0,1-1.05-.09l-83-14.66a6,6,0,1,1,2.09-11.81l83,14.65A6,6,0,0,1,186.11,75.51ZM180.56,107a6,6,0,0,1-5.9,5,5.48,5.48,0,0,1-1-.1l-83-14.65a6,6,0,0,1,2.09-11.82l83,14.66A6,6,0,0,1,180.56,107Zm-47,24.19a6,6,0,0,1-5.91,4.95,6.38,6.38,0,0,1-1.05-.09l-41.49-7.33a6,6,0,1,1,2.09-11.81l41.49,7.32A6,6,0,0,1,133.53,131.22Z"></path></svg> CV</a>
      {started && <a className={style.backbtn} href="/">Back</a>}
      <canvas ref={canvasRef} className={style.canvas} />
      {!started && (
        <>
          <h1>Hey, I'm Owais 👋</h1>
          <h2>Full Stack Web Developer</h2>
        </>
      )}
      <div className={style.chatlog}>
        {chat.map((msg, i) =>
  msg.isLoader ? (
    <div key={i} className={style.loaderDots}>
      typing...
    </div>
  ) : (
    <div
      key={i}
      className={style[msg.type]}
    >
      {msg.text}
    </div>
  )
)}

      </div>
          <form className={style.form} onSubmit={handleSubmit}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={loading}
          placeholder="Ask me anything..."
          className={style.input} />
        <button type="submit" className={style.button} disabled={loading}><svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 text-white" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg></button>
      </form>
      {!started && (
      <div className={style.mainbtns}>
        <button className={style.mainbtn} onClick={() => handleQuickAsk("Tell me about yourself")}>
          <svg style={{color:"#a31d1d"}} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" className="text-[#A31D1D]" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 448c-110.3 0-200-89.7-200-200S137.7 56 248 56s200 89.7 200 200-89.7 200-200 200zm117.8-146.4c-10.2-8.5-25.3-7.1-33.8 3.1-20.8 25-51.5 39.4-84 39.4s-63.2-14.3-84-39.4c-8.5-10.2-23.7-11.5-33.8-3.1-10.2 8.5-11.5 23.6-3.1 33.8 30 36 74.1 56.6 120.9 56.6s90.9-20.6 120.9-56.6c8.5-10.2 7.1-25.3-3.1-33.8zM168 240c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32zm160-60c-25.7 0-55.9 16.9-59.9 42.1-1.7 11.2 11.5 18.2 19.8 10.8l9.5-8.5c14.8-13.2 46.2-13.2 61 0l9.5 8.5c8.5 7.4 21.6.3 19.8-10.8-3.8-25.2-34-42.1-59.7-42.1z"></path></svg>Me
        </button>
        <button className={style.mainbtn} onClick={() => handleQuickAsk("Show me your projects")} >
          <svg style={{color:"oklch(70.4% .191 22.216)"}} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="text-red-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" r="26" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="10"></circle><circle cx="346" cy="256" r="26" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="10"></circle><circle cx="166" cy="256" r="26" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="10"></circle><path fill="none" strokeLinecap="square" strokeMiterlimit="10" strokeWidth="42" d="M160 368 32 256l128-112m192 224 128-112-128-112"></path></svg>Projects
        </button>
        <button className={style.mainbtn} onClick={() => handleQuickAsk("What are your skills?")}>
          <svg style={{color:"oklch(71.8% .202 349.761)"}} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-pink-400" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M20.0833 15.1999L21.2854 15.9212C21.5221 16.0633 21.5989 16.3704 21.4569 16.6072C21.4146 16.6776 21.3557 16.7365 21.2854 16.7787L12.5144 22.0412C12.1977 22.2313 11.8021 22.2313 11.4854 22.0412L2.71451 16.7787C2.47772 16.6366 2.40093 16.3295 2.54301 16.0927C2.58523 16.0223 2.64413 15.9634 2.71451 15.9212L3.9166 15.1999L11.9999 20.0499L20.0833 15.1999ZM20.0833 10.4999L21.2854 11.2212C21.5221 11.3633 21.5989 11.6704 21.4569 11.9072C21.4146 11.9776 21.3557 12.0365 21.2854 12.0787L11.9999 17.6499L2.71451 12.0787C2.47772 11.9366 2.40093 11.6295 2.54301 11.3927C2.58523 11.3223 2.64413 11.2634 2.71451 11.2212L3.9166 10.4999L11.9999 15.3499L20.0833 10.4999ZM12.5144 1.30864L21.2854 6.5712C21.5221 6.71327 21.5989 7.0204 21.4569 7.25719C21.4146 7.32757 21.3557 7.38647 21.2854 7.42869L11.9999 12.9999L2.71451 7.42869C2.47772 7.28662 2.40093 6.97949 2.54301 6.7427C2.58523 6.67232 2.64413 6.61343 2.71451 6.5712L11.4854 1.30864C11.8021 1.11864 12.1977 1.11864 12.5144 1.30864ZM11.9999 3.33233L5.88723 6.99995L11.9999 10.6676L18.1126 6.99995L11.9999 3.33233Z"></path></svg>Skills
        </button>
         <button className={style.mainbtn} onClick={() => handleQuickAsk("What is your experience?")}>
          <svg style={{color:"oklch(72.3% .219 149.579)"}} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="text-green-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 1A1.5 1.5 0 0 0 5 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H11v-.5A1.5 1.5 0 0 0 9.5 1zm0 1h3a.5.5 0 0 1 .5.5V3H6v-.5a.5.5 0 0 1 .5-.5m1.886 6.914L15 7.151V12.5a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5V7.15l6.614 1.764a1.5 1.5 0 0 0 .772 0M1.5 4h13a.5.5 0 0 1 .5.5v1.616L8.129 7.948a.5.5 0 0 1-.258 0L1 6.116V4.5a.5.5 0 0 1 .5-.5"></path></svg>Experience
        </button>
        <button className={style.mainbtn} onClick={() => handleQuickAsk("How can i contact you?")}>
          <svg style={{color:"oklch(62.7% .265 303.9)"}} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="text-purple-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" strokeWidth="2" d="M5,12 C3.343,12 2,10.657 2,9 C2,7.343 3.343,6 5,6 C6.657,6 8,7.343 8,9 C8,10.657 6.657,12 5,12 Z M9,18 L9,16 C9,13.7504 7.2128,12 4.964,12 L5.0184,12 C2.7688,12 1,13.7504 1,16 L1,18 M12,7 L24,7 M12,17 L22,17 M12,12 L19,12"></path></svg>Contact
        </button>
      </div>
      )}
    </div>
  );
};

export default App;
