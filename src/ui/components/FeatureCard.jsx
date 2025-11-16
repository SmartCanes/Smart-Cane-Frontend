import { forwardRef } from "react";
import { Icon } from "@iconify/react";

const FeatureCard = forwardRef(
  (
    {
      icon,
      title,
      description,
      mainImage,
      mainImageAlt = "",
      backgroundColor = "#11285A",
      textColor = "#FFFFFF",
      backgroundImage,
      backgroundImageOpacity = 0.14,
      backgroundImagePosition = "center",
      backgroundImageSize = "125%",
      backgroundImageClassName = "",
      backgroundImageStyle = {},
      backgroundIcon,
      backgroundIconProps = {},
      backgroundIconClassName = "",
      backgroundIconStyle = {},
      backgroundIconContainerClassName = "",
      backgroundIconContainerStyle = {},
      overlayGradient = true,
      overlayClassName = "bg-[linear-gradient(135deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_62%)]",
      outlineColor,
      isActive = false,
      activeClassName = "scale-[1.015]",
      inactiveClassName = "opacity-95",
      children,
      className = "",
      contentClassName = "",
      iconWrapperClassName = "bg-white text-[#11285A]",
      iconWrapperWidth = "160px",
      iconWrapperHeight = "160px",
      iconWrapperRounded = true,
      iconWrapperShadow = true,
      iconClassName = "text-[96px]",
      mainImageClassName = "h-40 w-40 object-contain",
      titleClassName = "",
      descriptionClassName = "text-white/80",
      badge,
      badgeClassName = "rounded-full border border-white/25 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/75",
      footer,
      footerClassName = "w-full pt-10",
      descriptionColor,
      style = {},
      ...rest
    },
    ref
  ) => {
    const renderIcon = () => {
      if (!icon) return null;
      if (typeof icon === "string") {
        return <Icon icon={icon} className={iconClassName} />;
      }
      return icon;
    };

    const renderBackgroundIcon = () => {
      if (!backgroundIcon) return null;
      if (typeof backgroundIcon === "string") {
        const { width = 420, height = 420, ...iconProps } = backgroundIconProps;
        return (
          <Icon
            icon={backgroundIcon}
            width={width}
            height={height}
            className={backgroundIconClassName}
            style={backgroundIconStyle}
            aria-hidden
            {...iconProps}
          />
        );
      }
      return backgroundIcon;
    };

    const primaryVisual = mainImage ? (
      <img
        src={mainImage}
        alt={mainImageAlt || title || "Feature visual"}
        className={`pointer-events-none select-none ${mainImageClassName}`}
        aria-hidden={mainImageAlt ? undefined : true}
      />
    ) : (
      renderIcon()
    );

    const outlineStyle = outlineColor
      ? { boxShadow: `inset 0 0 0 2px ${outlineColor}`, ...style }
      : style;

    return (
      <article
        ref={ref}
        role="group"
        // --- MGA PAGBABAGO DITO ---
        className={`relative flex flex-col flex-shrink-0 
                w-full max-w-md h-auto min-h-[520px] 
                md:w-[500px] md:h-[540px] 
                lg:w-[580px] lg:h-[580px] 
                rounded-[32px] md:rounded-[48px] 
                px-3 py-10 md:px-12 md:py-14 
                text-center border-card-100 border-4
                transition-all duration-300 ease-out 
                ${isActive ? activeClassName : inactiveClassName} ${className}`}
        style={{ backgroundColor, ...outlineStyle }}
        {...rest}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px] md:rounded-[48px]"
        >
          {backgroundImage && (
            <div
              className={`absolute inset-0 bg-no-repeat ${backgroundImageClassName}`}
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundPosition: backgroundImagePosition,
                backgroundSize: backgroundImageSize,
                opacity: backgroundImageOpacity,
                ...backgroundImageStyle
              }}
            />
          )}
          {backgroundIcon && (
            <div
              className={`absolute inset-0 flex items-center justify-center ${backgroundIconContainerClassName}`}
              style={backgroundIconContainerStyle}
            >
              {renderBackgroundIcon()}
            </div>
          )}
          {overlayGradient && (
            <div className={`absolute inset-0 ${overlayClassName}`} />
          )}
        </div>

        <div
          className={`relative z-10 flex h-full w-full flex-col items-center justify-between ${contentClassName}`}
        >
          <div className="flex w-full justify-start">
            {badge && (
              <span
                className={`font-montserrat text-[11px] uppercase ${badgeClassName}`}
              >
                {badge}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6 md:gap-8">
            {primaryVisual && (
              <div
                className={`flex items-center justify-center ${
                  iconWrapperRounded ? "rounded-full" : ""
                } ${
                  iconWrapperShadow
                    ? "shadow-[0_24px_44px_rgba(0,0,0,0.35)]"
                    : ""
                } ${iconWrapperClassName}`}
                style={{
                  width: iconWrapperWidth,
                  height: iconWrapperHeight,
                  overflow: "visible"
                }}
              >
                {primaryVisual}
              </div>
            )}
            {title && (
              <h3
                // --- PAGBABAGO DITO ---
                className={`font-poppins text-3xl md:text-[36px] font-semibold leading-tight tracking-wide ${titleClassName}`}
                style={{ color: textColor }}
              >
                {title}
              </h3>
            )}

            {description && (
              <p
                // --- MGA PAGBABAGO DITO ---
                className={`max-w-full text-base md:text-lg text-center md:text-left leading-relaxed ${descriptionClassName}`}
                style={{
                  color:
                    descriptionColor ??
                    (textColor === "#FFFFFF"
                      ? "rgba(255,255,255,0.85)"
                      : textColor)
                }}
              >
                {description}
              </p>
            )}
          </div>

          {(children || footer) && (
            <div className={footerClassName}>{children ?? footer}</div>
          )}
        </div>
      </article>
    );
  }
);

FeatureCard.displayName = "FeatureCard";

export default FeatureCard;
