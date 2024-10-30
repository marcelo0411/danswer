import React, {
  ReactNode,
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";

// Create a context for the tooltip group
const TooltipGroupContext = createContext<{
  setGroupHovered: React.Dispatch<React.SetStateAction<boolean>>;
  groupHovered: boolean;
  hoverCountRef: React.MutableRefObject<boolean>;
}>({
  setGroupHovered: () => {},
  groupHovered: false,
  hoverCountRef: { current: false },
});

export const TooltipGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [groupHovered, setGroupHovered] = useState(false);
  const hoverCountRef = useRef(false);

  return (
    <TooltipGroupContext.Provider
      value={{ groupHovered, setGroupHovered, hoverCountRef }}
    >
      <div className="inline-flex">{children}</div>
    </TooltipGroupContext.Provider>
  );
};

export const CustomTooltip = ({
  content,
  children,
  large,
  light,
  citation,
  line,
  medium,
  wrap,
  showTick = false,
  delay = 500,
  position = "bottom",
  disabled = false,
  link,
  customEvent,
}: {
  medium?: boolean;
  content: string | ReactNode;
  children: JSX.Element;
  large?: boolean;
  line?: boolean;
  light?: boolean;
  showTick?: boolean;
  delay?: number;
  wrap?: boolean;
  citation?: boolean;
  position?: "top" | "bottom";
  disabled?: boolean;
  link?: RequestInfo | URL;
  customEvent?: (event: React.MouseEvent<HTMLDivElement>) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [contentLinkTxt, setContentLinkTxt] = useState<ReactNode | string>('');
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const timeinRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { groupHovered, setGroupHovered, hoverCountRef } =
    useContext(TooltipGroupContext);

  const showTooltip = () => {
    hoverCountRef.current = true;

    const showDelay = groupHovered ? 0 : delay;
    timeoutRef.current = setTimeout(() => {
      fetchContent();
      setIsVisible(true);
      setGroupHovered(true);
      updateTooltipPosition();
    }, showDelay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    hoverCountRef.current = false;

    timeinRef.current = setTimeout(() => {
      if (!hoverCountRef.current) {
        setGroupHovered(false);
        setIsVisible(false);
      }
    }, 100);
  };

  const updateTooltipPosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: position === "top" ? rect.top - 10 : rect.bottom + 10,
        left: rect.left + rect.width / 2,
      });
    }
  };

  const handleTooltipMouseEnter = () => {
    if(timeinRef.current){
      clearTimeout(timeinRef.current)
    }
    hoverCountRef.current = true;
  }

  const handleTooltipMouseLeave = () => {
    hoverCountRef.current = false;
    setTimeout(()=>{
      setIsVisible(false);
    }, 100);
  }

  const fetchContent = async () => {
    if (!link) return;
    try {

      // 跨域影响，修改后端
      // const response = await fetch(link);
      // if (!response) {
      //   throw new Error('Network response is not normal');
      // }
      // const data = await response.text();

      setContentLinkTxt(content);
    } catch (error) {
      setContentLinkTxt('Unable to load content');
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {children}
      </span>
      {isVisible &&
        !disabled &&
        createPortal(
          <div
            ref={tooltipRef}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            className={`min-w-8 fixed z-[1000] ${citation ? "max-w-[350px]" : "w-40"
              } ${large ? (medium ? "w-88" : "w-96") : line && "max-w-64 w-auto"} 
            transform -translate-x-1/2 text-sm 
            ${light
                ? "text-gray-800 bg-background-200"
                : "text-white bg-background-800"
              } 
            rounded-lg shadow-lg`}
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            {showTick && (
              <div
                className={`absolute w-3 h-3 ${position === "top" ? "bottom-1.5" : "-top-1.5"
                  } left-1/2 transform -translate-x-1/2 rotate-45 
                ${light ? "bg-background-200" : "bg-background-800"}`}
              />
            )}
            <div
              className={`flex-wrap ${wrap && "w-full"} relative ${line ? "" : "flex"
                } p-2 cursor-pointer`}
              style={
                line || wrap
                  ? {
                    whiteSpace: wrap ? "normal" : "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }
                  : {}
              }
            >
              {link ? (<div className="grid" onClick={customEvent}>{contentLinkTxt}</div>) : content}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
