import React, { useEffect, useRef, useState } from "react";

const tooltipStyleBase = {
  position: "absolute",
  padding: "0.5rem 0.75rem",
  borderRadius: "8px",
  backgroundColor: "rgba(33, 37, 41, 0.95)",
  color: "#fff",
  fontSize: "1rem",
  fontWeight: 500,
  pointerEvents: "none",
  whiteSpace: "pre-wrap",
  zIndex: 9999,
  boxShadow: "0px 6px 18px rgba(0, 0, 0, 0.25)",
  maxWidth: "260px",
};

const wrapperStyle = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

export default function Tooltip({
  content,
  delay = 400,
  placement = "top",
  offset = 12,
  children,
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    translateX: "-50%",
    translateY: "-100%",
  });
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);

  const show = () => {
    if (!content) return;
    const node = triggerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();

    let top = -offset;
    let left = rect.width / 2;
    let translateX = "-50%";
    let translateY = "-100%";

    if (placement === "bottom") {
      top = rect.height + offset;
      translateY = "0";
    } else if (placement === "left") {
      top = rect.height / 2;
      left = -offset;
      translateX = "-100%";
      translateY = "-50%";
    } else if (placement === "right") {
      top = rect.height / 2;
      left = rect.width + offset;
      translateX = "0";
      translateY = "-50%";
    }

    setCoords({ top, left, translateX, translateY });
    setVisible(true);
  };

  const hide = () => {
    setVisible(false);
  };

  const handleMouseEnter = () => {
    timeoutRef.current = window.setTimeout(show, delay);
  };

  const handleFocus = () => {
    timeoutRef.current = window.setTimeout(show, delay);
  };

  const handleMouseLeave = () => {
    window.clearTimeout(timeoutRef.current);
    hide();
  };

  const handleBlur = () => {
    window.clearTimeout(timeoutRef.current);
    hide();
  };

  const child =
    typeof children === "string"
      ? <span>{children}</span>
      : children;

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  const cloned = React.cloneElement(child, {
    ...(child.props || {}),
    "aria-label": child.props?.["aria-label"] ?? content,
  });

  return (
    <span
      style={wrapperStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      ref={triggerRef}
    >
      {cloned}
      {visible && content && (
        <span
          role="tooltip"
          style={{
            ...tooltipStyleBase,
            top: coords.top,
            left: coords.left,
            transform: `translate(${coords.translateX}, ${coords.translateY})`,
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}

