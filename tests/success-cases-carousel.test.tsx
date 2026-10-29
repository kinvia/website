// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SuccessCasesCarousel } from '../src/components/SuccessCasesCarousel';
import { getDictionary } from '../src/i18n';

describe('SuccessCasesCarousel component', () => {
  const es = getDictionary('es');
  const cloudCases = es.axes.cloud.cases;
  const iotCases = es.axes.iot.cases;
  const labels = es.axes.casesLabels;

  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.removeAttribute('data-reduce-motion');
  });

  it('renders all cloud cases with card 0 active and card 1 peeking without pill buttons or media tabs', () => {
    const { container } = render(
      <SuccessCasesCarousel division="cloud" cases={cloudCases} labels={labels} />
    );

    const track = container.querySelector('.cases-track');
    expect(track).not.toBeNull();
    expect(track?.getAttribute('data-active-case')).toBe('0');

    const cards = container.querySelectorAll('.case-card');
    expect(cards).toHaveLength(3);
    expect(cards[0].classList.contains('is-active')).toBe(true);
    expect(cards[1].classList.contains('is-peek')).toBe(true);
    expect(cards[0].hasAttribute('inert')).toBe(false);
    expect(cards[1].hasAttribute('inert')).toBe(true);
    expect(cards[2].hasAttribute('inert')).toBe(true);

    // Pill buttons and media text tabs have been removed
    expect(container.querySelector('.cases-pills')).toBeNull();
    expect(container.querySelector('.case-pill')).toBeNull();
    expect(container.querySelector('.case-media-tabs')).toBeNull();
    expect(container.querySelector('.media-tab-btn')).toBeNull();

    // Clients are rendered in card content
    expect(screen.getByText('Sercore')).not.toBeNull();
    expect(screen.getByText('Ramos Calabria Abogados')).not.toBeNull();
    expect(screen.getByText('CAPSA / UCAM')).not.toBeNull();
  });

  it('clicking next and prev buttons wraps around cleanly in 3-case and 2-case carousels', () => {
    // 3 cases (cloud)
    const { container: cloudContainer } = render(
      <SuccessCasesCarousel division="cloud" cases={cloudCases} labels={labels} />
    );
    const nextBtn = cloudContainer.querySelector('.cases-nav-next') as HTMLButtonElement;
    const prevBtn = cloudContainer.querySelector('.cases-nav-prev') as HTMLButtonElement;
    const cloudTrack = cloudContainer.querySelector('.cases-track')!;

    // 0 -> 1 -> 2 -> 0
    fireEvent.click(nextBtn);
    expect(cloudTrack.getAttribute('data-active-case')).toBe('1');
    fireEvent.click(nextBtn);
    expect(cloudTrack.getAttribute('data-active-case')).toBe('2');
    fireEvent.click(nextBtn);
    expect(cloudTrack.getAttribute('data-active-case')).toBe('0');

    // 0 -> 2 (prev wraps to last)
    fireEvent.click(prevBtn);
    expect(cloudTrack.getAttribute('data-active-case')).toBe('2');

    // 2 cases (iot): 0 -> 1 -> 0
    const { container: iotContainer } = render(
      <SuccessCasesCarousel division="iot" cases={iotCases} labels={labels} />
    );
    const iotNext = iotContainer.querySelector('.cases-nav-next') as HTMLButtonElement;
    const iotTrack = iotContainer.querySelector('.cases-track')!;
    expect(iotTrack.getAttribute('data-active-case')).toBe('0');
    fireEvent.click(iotNext);
    expect(iotTrack.getAttribute('data-active-case')).toBe('1');
    fireEvent.click(iotNext);
    expect(iotTrack.getAttribute('data-active-case')).toBe('0');
  });

  it('clicking the peeking card activates it', () => {
    const { container } = render(
      <SuccessCasesCarousel division="cloud" cases={cloudCases} labels={labels} />
    );
    const track = container.querySelector('.cases-track')!;
    const cards = container.querySelectorAll('.case-card');

    fireEvent.click(cards[1]);
    expect(track.getAttribute('data-active-case')).toBe('1');
    expect(cards[1].classList.contains('is-active')).toBe(true);
  });

  it('switches between screenshots of an active card via dot indicators and arrow buttons', () => {
    const { container } = render(
      <SuccessCasesCarousel division="cloud" cases={cloudCases} labels={labels} />
    );
    const track = container.querySelector('.cases-track')!;
    expect(track.getAttribute('data-active-case')).toBe('0');

    const firstCard = container.querySelectorAll('.case-card')[0];
    const imageStage = firstCard.querySelector('.case-media-stage')!;
    expect(imageStage.getAttribute('data-active-image')).toBe('0');

    // Dot 2 click
    const dots = firstCard.querySelectorAll('.case-dot');
    expect(dots.length).toBe(3);
    fireEvent.click(dots[1]);

    expect(imageStage.getAttribute('data-active-image')).toBe('1');
    expect(track.getAttribute('data-active-case')).toBe('0');

    // Next button
    const nextImgBtn = firstCard.querySelector('.img-nav-next') as HTMLButtonElement;
    fireEvent.click(nextImgBtn);
    expect(imageStage.getAttribute('data-active-image')).toBe('2');
    expect(track.getAttribute('data-active-case')).toBe('0');
  });

  it('navigates cases via ArrowRight and ArrowLeft keyboard keys', () => {
    const { container } = render(
      <SuccessCasesCarousel division="cloud" cases={cloudCases} labels={labels} />
    );
    const carouselRegion = container.querySelector('.cases-carousel')!;
    const track = container.querySelector('.cases-track')!;

    fireEvent.keyDown(carouselRegion, { key: 'ArrowRight' });
    expect(track.getAttribute('data-active-case')).toBe('1');

    fireEvent.keyDown(carouselRegion, { key: 'ArrowLeft' });
    expect(track.getAttribute('data-active-case')).toBe('0');
  });

  it('opens lightbox when clicking image, allows cycling screenshots, and closes on close button or Escape', () => {
    const { container } = render(
      <SuccessCasesCarousel division="cloud" cases={cloudCases} labels={labels} />
    );
    const activeCard = container.querySelectorAll('.case-card')[0];
    const imageStage = activeCard.querySelector('.case-media-stage')!;

    // Lightbox not open initially
    expect(document.querySelector('.case-lightbox-backdrop')).toBeNull();

    // Click on image stage to open
    fireEvent.click(imageStage);
    const backdrop = document.querySelector('.case-lightbox-backdrop');
    expect(backdrop).not.toBeNull();
    expect(backdrop?.getAttribute('role')).toBe('dialog');

    // Current image in lightbox
    const lightboxImg = backdrop?.querySelector('.case-lightbox-img') as HTMLImageElement;
    expect(lightboxImg).not.toBeNull();
    expect(lightboxImg.src).toContain(cloudCases[0].images[0].src);

    // Lightbox next button
    const lightboxNext = backdrop?.querySelector('.case-lightbox-next') as HTMLButtonElement;
    fireEvent.click(lightboxNext);
    expect(lightboxImg.src).toContain(cloudCases[0].images[1].src);

    // Escape closes lightbox
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(document.querySelector('.case-lightbox-backdrop')).toBeNull();

    // Re-open and close with close button
    fireEvent.click(imageStage);
    expect(document.querySelector('.case-lightbox-backdrop')).not.toBeNull();
    const closeBtn = document.querySelector('.case-lightbox-close') as HTMLButtonElement;
    fireEvent.click(closeBtn);
    expect(document.querySelector('.case-lightbox-backdrop')).toBeNull();
  });

  it('auto-rotates images and clients sequentially every 5 seconds, pausing on hover', () => {
    vi.useFakeTimers();

    const { container } = render(
      <SuccessCasesCarousel division="cloud" cases={cloudCases} labels={labels} />
    );
    const track = container.querySelector('.cases-track')!;
    const carousel = container.querySelector('.cases-carousel')!;
    const firstCard = container.querySelectorAll('.case-card')[0];
    const imageStage = firstCard.querySelector('.case-media-stage')!;

    // Initially Case 0, Image 0
    expect(track.getAttribute('data-active-case')).toBe('0');
    expect(imageStage.getAttribute('data-active-image')).toBe('0');

    // Advance 5000ms -> Image 1 of Case 0
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.getAttribute('data-active-case')).toBe('0');
    expect(imageStage.getAttribute('data-active-image')).toBe('1');

    // Advance 5000ms -> Image 2 of Case 0
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.getAttribute('data-active-case')).toBe('0');
    expect(imageStage.getAttribute('data-active-image')).toBe('2');

    // Advance 5000ms -> Wraps to Image 0 and advances to Case 1
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(track.getAttribute('data-active-case')).toBe('1');

    // Hover pauses auto-rotation
    fireEvent.mouseEnter(carousel);
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    // Should still be on Case 1
    expect(track.getAttribute('data-active-case')).toBe('1');

    // Mouse leave resumes auto-rotation
    fireEvent.mouseLeave(carousel);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    // Advanced image of Case 1
    const secondCard = container.querySelectorAll('.case-card')[1];
    const secondStage = secondCard.querySelector('.case-media-stage')!;
    expect(secondStage.getAttribute('data-active-image')).toBe('1');
  });
});
