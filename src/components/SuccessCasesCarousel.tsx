import React, { useState } from 'react';
import type { SuccessCaseItem, SuccessCasesLabels } from '../i18n';

export interface SuccessCasesCarouselProps {
  division: 'cloud' | 'iot';
  cases: SuccessCaseItem[];
  labels: SuccessCasesLabels;
}

export function SuccessCasesCarousel({ division, cases, labels }: SuccessCasesCarouselProps) {
  const [activeCase, setActiveCase] = useState(0);
  const [activeImages, setActiveImages] = useState<Record<string, number>>({});

  const count = cases.length;

  const goToNextCase = () => {
    setActiveCase((prev) => (prev + 1) % count);
  };

  const goToPrevCase = () => {
    setActiveCase((prev) => (prev - 1 + count) % count);
  };

  const goToCase = (idx: number) => {
    if (idx >= 0 && idx < count) {
      setActiveCase(idx);
    }
  };

  const goToNextImage = (caseId: string, imgCount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImages((prev) => ({
      ...prev,
      [caseId]: ((prev[caseId] || 0) + 1) % imgCount,
    }));
  };

  const goToPrevImage = (caseId: string, imgCount: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImages((prev) => ({
      ...prev,
      [caseId]: ((prev[caseId] || 0) - 1 + imgCount) % imgCount,
    }));
  };

  const goToImage = (caseId: string, imgIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImages((prev) => ({
      ...prev,
      [caseId]: imgIdx,
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
      onKeyDown={handleKeyDown}
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

      <div className="cases-pills" role="tablist">
        {cases.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={idx === activeCase}
            aria-pressed={idx === activeCase}
            className={`case-pill ${idx === activeCase ? 'is-active' : ''}`}
            onClick={() => goToCase(idx)}
          >
            <span className="pill-index">0{idx + 1}</span>
            <span className="pill-client">{c.client}</span>
          </button>
        ))}
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
            const isPeek = idx === (activeCase + 1) % count && count > 1;
            const isPrev = idx === (activeCase - 1 + count) % count && count > 1;

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
              >
                <div className="case-media">
                  <div className="case-media-stage" data-active-image={currentImgIdx}>
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
                  </div>

                  <div className="case-media-tabs" role="tablist">
                    {c.images.map((img, imgIdx) => (
                      <button
                        key={img.src}
                        type="button"
                        role="tab"
                        aria-selected={imgIdx === currentImgIdx}
                        className={`media-tab-btn ${imgIdx === currentImgIdx ? 'is-active' : ''}`}
                        onClick={(e) => goToImage(c.id, imgIdx, e)}
                      >
                        <span className="media-tab-idx">0{imgIdx + 1}</span>
                        <span className="media-tab-label">{img.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="case-body">
                  <div className="case-sector-badge">{c.sector}</div>
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
    </div>
  );
}
