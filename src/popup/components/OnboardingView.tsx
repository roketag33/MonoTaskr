import React, { useState } from 'react';
import { I18nService } from '../../shared/i18n.service';

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 3;

  return (
    <div id="onboarding-view">
      {currentSlide === 1 && (
        <div className="slide active">
          <h2>{I18nService.getMessage('onboardingWelcomeTitle')}</h2>
          <p>{I18nService.getMessage('onboardingWelcomeText')}</p>
          <div className="illustration">🎯</div>
        </div>
      )}

      {currentSlide === 2 && (
        <div className="slide active">
          <h2>{I18nService.getMessage('onboardingBlockTitle')}</h2>
          <p>{I18nService.getMessage('onboardingBlockText')}</p>
          <ul className="blocked-list">
            <li>📺 YouTube</li>
            <li>📘 Facebook</li>
            <li>🐦 Twitter</li>
            <li>📸 Instagram</li>
          </ul>
        </div>
      )}

      {currentSlide === 3 && (
        <div className="slide active">
          <h2>{I18nService.getMessage('onboardingReadyTitle')}</h2>
          <p>{I18nService.getMessage('onboardingReadyText')}</p>
          <div className="illustration">🚀</div>
        </div>
      )}

      <div className="onboarding-controls">
        <div className="dots">
          {[1, 2, 3].map((i) => (
            <span key={i} className={`dot ${currentSlide === i ? 'active' : ''}`}></span>
          ))}
        </div>
        <div className="buttons">
          <button className="text-btn" onClick={onComplete}>
            {I18nService.getMessage('btnSkip')}
          </button>
          {currentSlide < totalSlides ? (
            <button className="primary-btn" onClick={() => setCurrentSlide((c) => c + 1)}>
              {I18nService.getMessage('btnNext')}
            </button>
          ) : (
            <button className="primary-btn" onClick={onComplete}>
              {I18nService.getMessage('btnStartFocus')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
