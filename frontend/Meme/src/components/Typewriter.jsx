import React, { useState, useEffect } from "react";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Typewriter = ({ text, speed = 70, delayBeforeStart = 0 }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (delayBeforeStart > 0) {
        await sleep(delayBeforeStart);
      }

      for (let i = 0; i <= text.length; i++) {
        if (!isMounted) return;
        setDisplayed(text.slice(0, i));
        await sleep(speed);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [text, speed, delayBeforeStart]);

  return <span>{displayed}</span>;
};

export default Typewriter;
