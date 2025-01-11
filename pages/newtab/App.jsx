import { DARK_THEME, FONTNAME_LIST, LIGHT_THEME, POEM_MAXLINELENGTH } from "../components/constants";
import { getRandomPoem } from "../components/poems";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { IoMoonOutline as MoonIcon, IoSunnyOutline as SunIcon } from "react-icons/io5";
import { MdTimelapse as SyncIcon } from "react-icons/md";
import { BiFontFamily as FontIcon } from "react-icons/bi";
import "animate.css";
import "./App.css";

export default function App() {
  const mediaQuery = useMemo(() => window.matchMedia("(prefers-color-scheme: dark)"), []);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "sync");
  const [fontIndex, setFontIndex] = useState(() => parseInt(localStorage.getItem("fontIndex") || "0", 10));
  const [poem, setPoem] = useState(() => getRandomPoem());
  const [isAnimating, setIsAnimating] = useState(true);

  const mediaHandleChange = useCallback((event) => {
    const storedTheme = localStorage.getItem("theme") || "sync";
    if (storedTheme === "sync") {
      document.documentElement.setAttribute("data-theme", event.matches ? DARK_THEME : LIGHT_THEME);
    } else {
      document.documentElement.setAttribute("data-theme", storedTheme === "dark" ? DARK_THEME : LIGHT_THEME);
    }
  }, []);

  useEffect(() => {
    mediaQuery.addEventListener("change", mediaHandleChange);
    return () => mediaQuery.removeEventListener("change", mediaHandleChange);
  }, [mediaQuery, mediaHandleChange]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    mediaHandleChange(mediaQuery);
  }, [theme, mediaHandleChange, mediaQuery]);

  useEffect(() => {
    localStorage.setItem("fontIndex", fontIndex.toString());
  }, [fontIndex]);

  useEffect(() => {
    let newTitle = poem.title;
    if (!/^[A-Za-z]/.test(newTitle[0])) {
      newTitle = newTitle
        .replace(/[^\u4E00-\u9FA5\t\n\r]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (newTitle.length >= POEM_MAXLINELENGTH) {
        const lines = newTitle.split(/\s+/);
        const result =
          lines.length % 2 === 0
            ? lines.reduce(
                (acc, line, i) => (i % 2 === 0 ? [...acc, line] : [...acc.slice(0, -1), `${acc.slice(-1)[0]} ${line}`]),
                []
              )
            : lines;
        newTitle = result.join("\n");
      }
    }

	newTitle = newTitle.replaceAll(" ", "\n");
    setPoem((prevPoem) => ({ ...prevPoem, title: newTitle }));
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, [poem.title]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => ["light", "dark", "sync"][(["light", "dark", "sync"].indexOf(prevTheme) + 1) % 3]);
  }, []);

  const toggleFont = useCallback(() => {
    setFontIndex((prevIndex) => (prevIndex + 1) % FONTNAME_LIST.length);
  }, []);

  return (
    <div id="app" className="custom-font" style={{ "--custom-font-name": FONTNAME_LIST[fontIndex] }}>
      <div className="min-h-screen flex items-center justify-center">
        <div
          className={`justify-center text-center ${isAnimating ? "animate__animated animate__fadeIn animate__faster" : ""}`}
        >
          <div className="justify-center item-center flex flex-col">
            <p
              id="poem-title-container"
              className="text-5xl mb-10 whitespace-pre-wrap cursor-pointer transition-all duration-300"
			  style={{
				maxWidth: "90vw",
				lineHeight: 1.25
			  }}
            >
              {poem.title}
            </p>
          </div>
          <div id="poem-author-container" className="flex justify-center">
            <p className="text-3xl mr-4 transition-all duration-300 hover:text-opacity-80">
              <a href={`https://www.baidu.com/s?wd=${poem.from} ${poem.who || ""}`} target="_blank" rel="noopener noreferrer">
                「{poem.from}」
              </a>
            </p>
            {poem.who && (
              <p className="flex align-items-center justify-center text-center text-2xl rounded-md px-2 py-0 custom-author-style transition-all duration-300 hover:opacity-80">
                <a className="leading-normal" href={`https://www.baidu.com/s?wd=${poem.who}`} target="_blank" rel="noopener noreferrer">
                  {poem.who}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 z-50 flex">
        <div
          className="tooltip"
          data-tip={`${theme === "sync" ? "系统主题" : theme === "dark" ? "深色主题" : "浅色主题"}`}
        >
          <div
            id="theme-toggle"
            className="custom-settings-button-style transition-all duration-300"
            onClick={toggleTheme}
          >
            {theme === "light" && <SunIcon className="swap-on fill-current w-8 h-8" />}
            {theme === "dark" && <MoonIcon className="swap-on fill-current w-8 h-8" />}
            {theme === "sync" && <SyncIcon className="swap-on fill-current w-8 h-8" />}
          </div>
        </div>

        <div className="ml-4"></div>
        <div className="tooltip" data-tip="切换字体">
          <div id="font-toggle" className="custom-settings-button-style transition-all duration-300">
            <label className="swap">
              <input type="checkbox" onClick={toggleFont} />
              <FontIcon className="swap-on fill-current w-8 h-8" />
              <FontIcon className="swap-off fill-current w-8 h-8" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
