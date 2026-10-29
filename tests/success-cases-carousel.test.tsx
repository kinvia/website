// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SuccessCasesCarousel } from '../src/components/SuccessCasesCarousel';
import { getDictionary } from '../src/i18n';

describe('SuccessCasesCarousel component', () => {
  const es = getDictionary('es');
  const cloudCases = es.axes.cloud.cases;
  const iotCases = es.axes.iot.cases;
  const labels = es.axes.casesLabels;

  it('renders all cloud cases with card 0 active and card 1 peeking', () => {
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

  it('clicking the peeking card activates it, and pill selector switches directly', () => {
    const { container } = render(
      <SuccessCasesCarousel division="cloud" cases={cloudCases} labels={labels} />
    );
    const track = container.querySelector('.cases-track')!;
    const cards = container.querySelectorAll('.case-card');

    // Click card 1 directly
    fireEvent.click(cards[1]);
    expect(track.getAttribute('data-active-case')).toBe('1');
    expect(cards[1].classList.contains('is-active')).toBe(true);

    // Click pill for card 2 (CAPSA)
    const capsaPill = screen.getByRole('tab', { name: /CAPSA/i });
    fireEvent.click(capsaPill);
    expect(track.getAttribute('data-active-case')).toBe('2');
  });

  it('switches between the 3 screenshots of a card without changing the active case', () => {
    const { container } = render(
      <SuccessCasesCarousel division="cloud" cases={cloudCases} labels={labels} />
    );
    const track = container.querySelector('.cases-track')!;
    expect(track.getAttribute('data-active-case')).toBe('0');

    const firstCard = container.querySelectorAll('.case-card')[0];
    const imageStage = firstCard.querySelector('.case-media-stage')!;
    expect(imageStage.getAttribute('data-active-image')).toBe('0');

    // Click tab 2 ("Kanban y Mapa Operativo")
    const tab2 = screen.getByRole('tab', { name: /Kanban/i });
    fireEvent.click(tab2);

    expect(imageStage.getAttribute('data-active-image')).toBe('1');
    // Case remains 0!
    expect(track.getAttribute('data-active-case')).toBe('0');

    // Click next screenshot button
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
});
