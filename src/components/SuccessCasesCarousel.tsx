import React, { useState, useEffect, useCallback } from 'react';
import type { SuccessCaseItem, SuccessCasesLabels } from '../i18n';

export interface SuccessCasesCarouselProps {
  division: 'cloud' | 'iot';
  cases: SuccessCaseItem[];
  labels: SuccessCasesLabels;
}

export function SuccessCasesCarousel({ division, cases, labels }: SuccessCasesCarouselProps) {
  const [activeCase, setActiveCase] = useState(0);
  const [activeImages, setActiveImages] = useState<Record<string, number>>({});
  const [isInteracting, setIsInteracting] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean; imageIdx: number }>({
    open: false,
    imageIdx: 0,
  });

  const count = cases.length;
  const currentCase = cases[activeCase];
  const activeImageIdx = activeImages[currentCase?.id] || 0;

  const goToNextCase = useCallback(() => {
    setActiveCase((prev) => (prev + 1) % count);
  }, [count]);

  const goToPrevCase = useCallback(() => {
    setActiveCase((prev) => (prev - 1 + count) % count);
  }, [count]);

  const goToCase = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < count) {
        setActiveCase(idx);
      }
    },
    [count]
  );

  const goToNextImage = useCallback(
    (caseId: string, imgCount: number, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setActiveImages((prev) => ({
        ...prev,
        [caseId]: ((prev[caseId] || 0) + 1) % imgCount,
      }));
    },
    []
  );

  const goToPrevImage = useCallback(
    (caseId: string, imgCount: number, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setActiveImages((prev) => ({
        ...prev,
        [caseId]: ((prev[caseId] || 0) - 1 + imgCount) % imgCount,
      }));
    },
    []
  );

  const goToImage = useCallback(
    (caseId: string, imgIdx: number, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setActiveImages((prev) => ({
        ...prev,
        [caseId]: imgIdx,
      }));
    },
    []
  );

  // Lightbox handlers
  const openLightbox = (imgIdx: number) => {
    setLightbox({ open: true, imageIdx: imgIdx });
  };

  const closeLightbox = useCallback(() => {
    setLightbox((prev) => ({ ...prev, open: false }));
  }, []);

  const goToNextLightboxImage = useCallback(() => {
    if (!currentCase) return;
    const nextIdx = (lightbox.imageIdx + 1) % currentCase.images.length;
    setLightbox((prev) => ({ ...prev, imageIdx: nextIdx }));
    // Synchronize card active image
    setActiveImages((prev) => ({ ...prev, [currentCase.id]: nextIdx }));
  }, [currentCase, lightbox.imageIdx]);

  const goToPrevLightboxImage = useCallback(() => {
    if (!currentCase) return;
    const prevIdx =
      (lightbox.imageIdx - 1 + currentCase.images.length) % currentCase.images.length;
    setLightbox((prev) => ({ ...prev, imageIdx: prevIdx }));
    // Synchronize card active image
    setActiveImages((prev) => ({ ...prev, [currentCase.id]: prevIdx }));
  }, [currentCase, lightbox.imageIdx]);

  // Handle global keyboard for Lightbox
  useEffect(() => {
    if (!lightbox.open) return;

    const prevOverflow = typeof document !== 'undefined' ? document.body.style.overflow : '';
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }

    const handleLightboxKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextLightboxImage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevLightboxImage();
      }
    };

    window.addEventListener('keydown', handleLightboxKeyDown);
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = prevOverflow;
      }
      window.removeEventListener('keydown', handleLightboxKeyDown);
    };
  }, [lightbox.open, closeLightbox, goToNextLightboxImage, goToPrevLightboxImage]);

  // Auto-rotation timer: cycles screenshot every 5s; when finishing a case's screenshots, advances case
  useEffect(() => {
    if (isInteracting || lightbox.open) return;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const motionQuery =
        typeof window.matchMedia === 'function'
          ? window.matchMedia('(prefers-reduced-motion: reduce)')
          : null;
      const isReducedByAttr =
        typeof document !== 'undefined' &&
        (document.documentElement.getAttribute('data-reduce-motion') === 'true' ||
          document.body.getAttribute('data-reduce-motion') === 'true');
      if (motionQuery?.matches || isReducedByAttr) {
        return;
      }
    }

    const timer = setInterval(() => {
      const activeCaseData = cases[activeCase];
      if (!activeCaseData) return;
      const curImg = activeImages[activeCaseData.id] || 0;
      const numImages = activeCaseData.images.length;

      if (curImg < numImages - 1) {
        setActiveImages((prev) => ({
          ...prev,
          [activeCaseData.id]: curImg + 1,
        }));
      } else {
        setActiveImages((prev) => ({
          ...prev,
          [activeCaseData.id]: 0,
        }));
        setActiveCase((prev) => (prev + 1) % cases.length);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [activeCase, activeImages, isInteracting, lightbox.open, cases]);

  const handleContainerKeyDown = (e: React.KeyboardEvent) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNextCase();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevCase();
    }
  };

  return (
    <div
      className={`cases-carousel cases-carousel-${division}`}
      tabIndex={0}
      onKeyDown={handleContainerKeyDown}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsInteracting(false);
        }
      }}
      onTouchStart={() => setIsInteracting(true)}
      onTouchEnd={() => setIsInteracting(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label={labels.sectionHeading}
    >
      <div className="cases-carousel-header">
        <div className="cases-header-meta">
          <span className="cases-eyebrow">{labels.sectionHeading}</span>
          <span className="cases-counter">
            0{activeCase + 1} / 0{count}
          </span>
        </div>
        <div className="cases-nav-controls">
          <button
            type="button"
            className="cases-nav-btn cases-nav-prev"
            aria-label={labels.prevCase}
            onClick={goToPrevCase}
          >
            ‹
          </button>
          <button
            type="button"
            className="cases-nav-btn cases-nav-next"
            aria-label={labels.nextCase}
            onClick={goToNextCase}
          >
            ›
          </button>
        </div>
      </div>

      <div className="cases-track-viewport">
        <div
          className="cases-track"
          data-active-case={activeCase}
          style={{ '--active-case': activeCase } as React.CSSProperties}
        >
          {cases.map((c, idx) => {
            const currentImgIdx = activeImages[c.id] || 0;
            const isCurrent = idx === activeCase;
            const isPeek =
              count > 2 ? idx === (activeCase + 1) % count : activeCase === 0 && idx === 1;
            const isPrev =
              count > 2
                ? idx === (activeCase - 1 + count) % count
                : activeCase === 1 && idx === 0;

            let cardClass = 'case-card';
            if (isCurrent) cardClass += ' is-active';
            else if (isPeek) cardClass += ' is-peek';
            else if (isPrev) cardClass += ' is-prev';

            return (
              <article
                key={c.id}
                className={cardClass}
                onClick={() => !isCurrent && goToCase(idx)}
                aria-hidden={!isCurrent}
                inert={!isCurrent ? true : undefined}
              >
                <div className="case-media">
                  <div
                    className="case-media-stage"
                    data-active-image={currentImgIdx}
                    role="button"
                    tabIndex={isCurrent ? 0 : -1}
                    aria-label={labels.enlargeImage || 'Ampliar imagen'}
                    onClick={() => isCurrent && openLightbox(currentImgIdx)}
                    onKeyDown={(e) => {
                      if (isCurrent && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        openLightbox(currentImgIdx);
                      }
                    }}
                  >
                    {c.images.map((img, imgIdx) => (
                      <div
                        key={img.src}
                        className={`case-screenshot-slide ${imgIdx === currentImgIdx ? 'is-active' : ''}`}
                        aria-hidden={imgIdx !== currentImgIdx}
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          width="1280"
                          height="714"
                          loading="lazy"
                          decoding="async"
                          className="case-screenshot-img"
                        />
                      </div>
                    ))}

                    <div className="case-zoom-hint" aria-hidden="true">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                      </svg>
                    </div>

                    <button
                      type="button"
                      className="img-nav-btn img-nav-prev"
                      aria-label={labels.prevImage}
                      onClick={(e) => goToPrevImage(c.id, c.images.length, e)}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="img-nav-btn img-nav-next"
                      aria-label={labels.nextImage}
                      onClick={(e) => goToNextImage(c.id, c.images.length, e)}
                    >
                      ›
                    </button>

                    <div
                      className="case-media-dots"
                      role="tablist"
                      aria-label="Pantallas"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.images.map((img, imgIdx) => (
                        <button
                          key={img.src}
                          type="button"
                          role="tab"
                          aria-selected={imgIdx === currentImgIdx}
                          aria-label={`${imgIdx + 1} / ${c.images.length}`}
                          className={`case-dot ${imgIdx === currentImgIdx ? 'is-active' : ''}`}
                          onClick={(e) => goToImage(c.id, imgIdx, e)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="case-body">
                  <div className="case-meta-header">
                    <span className="case-client-name">{c.client}</span>
                    <span className="case-sector-badge">{c.sector}</span>
                  </div>
                  <h4 className="case-title">{c.title}</h4>

                  <div className="case-narrative">
                    <div className="case-story-block">
                      <span className="story-label">{labels.challengeLabel}</span>
                      <p className="story-text">{c.challenge}</p>
                    </div>

                    <div className="case-story-block">
                      <span className="story-label">{labels.solutionLabel}</span>
                      <p className="story-text">{c.solution}</p>
                    </div>
                  </div>

                  <ul className="case-highlights">
                    {c.highlights.map((pt) => (
                      <li key={pt}>{pt}</li>
                    ))}
                  </ul>

                  <div className="case-impact-badge">
                    <span className="impact-icon" aria-hidden="true">
                      ✓
                    </span>
                    <div className="impact-text-wrapper">
                      <span className="impact-prefix">{labels.impactLabel}: </span>
                      <span className="impact-val">{c.impact}</span>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {lightbox.open && currentCase && (
        <div
          className="case-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={labels.enlargeImage || 'Vista ampliada'}
          onClick={closeLightbox}
        >
          <div className="case-lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="case-lightbox-close"
              aria-label={labels.closeLightbox || 'Cerrar ampliación'}
              onClick={closeLightbox}
            >
              ✕
            </button>

            <div className="case-lightbox-stage">
              <img
                src={currentCase.images[lightbox.imageIdx]?.src}
                alt={currentCase.images[lightbox.imageIdx]?.alt}
                className="case-lightbox-img"
              />

              <button
                type="button"
                className="case-lightbox-nav case-lightbox-prev"
                aria-label={labels.prevImage}
                onClick={goToPrevLightboxImage}
              >
                ‹
              </button>
              <button
                type="button"
                className="case-lightbox-nav case-lightbox-next"
                aria-label={labels.nextImage}
                onClick={goToNextLightboxImage}
              >
                ›
              </button>
            </div>

            <div className="case-lightbox-caption">
              <span className="case-lightbox-client">{currentCase.client}</span>
              <span className="case-lightbox-counter">
                0{lightbox.imageIdx + 1} / 0{currentCase.images.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
