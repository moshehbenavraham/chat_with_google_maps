/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { describe, it, expect } from 'vitest';
import {
  transitions,
  fadeIn,
  fadeInUp,
  slideInRight,
  slideInLeft,
  scaleIn,
  backdropFade,
  fadeInWithShake,
  staggerContainer,
  staggerItem,
  buttonTap,
  buttonSubtle,
  spinnerRotate,
  pulse,
} from '../animations';

describe('animations', () => {
  describe('transitions', () => {
    it('should export transition presets', () => {
      expect(transitions).toBeDefined();
      expect(transitions.micro).toBeDefined();
      expect(transitions.press).toBeDefined();
      expect(transitions.modalIn).toBeDefined();
      expect(transitions.modalOut).toBeDefined();
      expect(transitions.slide).toBeDefined();
      expect(transitions.staggerDelay).toBe(0.05);
    });

    it('should have correct duration values', () => {
      expect(transitions.micro.duration).toBe(0.15);
      expect(transitions.press.duration).toBe(0.1);
      expect(transitions.modalIn.duration).toBe(0.2);
      expect(transitions.modalOut.duration).toBe(0.15);
      expect(transitions.slide.duration).toBe(0.25);
    });
  });

  describe('fadeIn variant', () => {
    it('should have initial, animate, and exit states', () => {
      expect(fadeIn.initial).toEqual({ opacity: 0 });
      expect(fadeIn.animate).toEqual({ opacity: 1 });
      expect(fadeIn.exit).toEqual({ opacity: 0 });
    });
  });

  describe('fadeInUp variant', () => {
    it('should animate opacity and y position', () => {
      expect(fadeInUp.initial).toEqual({ opacity: 0, y: 10 });
      expect(fadeInUp.animate).toEqual({ opacity: 1, y: 0 });
      expect(fadeInUp.exit).toEqual({ opacity: 0, y: 10 });
    });
  });

  describe('slideInRight variant', () => {
    it('should slide from right edge', () => {
      expect(slideInRight.initial).toEqual({ x: '100%' });
      expect(slideInRight.animate).toEqual({ x: 0 });
      expect(slideInRight.exit).toEqual({ x: '100%' });
    });
  });

  describe('slideInLeft variant', () => {
    it('should slide from left edge', () => {
      expect(slideInLeft.initial).toEqual({ x: '-100%' });
      expect(slideInLeft.animate).toEqual({ x: 0 });
      expect(slideInLeft.exit).toEqual({ x: '-100%' });
    });
  });

  describe('scaleIn variant', () => {
    it('should scale and fade', () => {
      expect(scaleIn.initial).toEqual({ scale: 0.95, opacity: 0 });
      expect(scaleIn.animate).toEqual({ scale: 1, opacity: 1 });
      expect(scaleIn.exit).toEqual({ scale: 0.95, opacity: 0 });
    });
  });

  describe('backdropFade variant', () => {
    it('should fade in and out', () => {
      expect(backdropFade.initial).toEqual({ opacity: 0 });
      expect(backdropFade.animate).toEqual({ opacity: 1 });
      expect(backdropFade.exit).toEqual({ opacity: 0 });
    });
  });

  describe('fadeInWithShake variant', () => {
    it('should have initial and exit states', () => {
      expect(fadeInWithShake.initial).toEqual({ opacity: 0, x: 0 });
      expect(fadeInWithShake.exit).toEqual({ opacity: 0 });
    });

    it('should have shake keyframes in animate state', () => {
      const animate = fadeInWithShake.animate as { x: number[]; opacity: number };
      expect(animate.x).toEqual([0, -5, 5, -5, 5, 0]);
      expect(animate.opacity).toBe(1);
    });
  });

  describe('staggerContainer variant', () => {
    it('should have staggerChildren in animate transition', () => {
      const animate = staggerContainer.animate as {
        transition: { staggerChildren: number };
      };
      expect(animate.transition.staggerChildren).toBe(0.05);
    });
  });

  describe('staggerItem variant', () => {
    it('should fade in with y movement', () => {
      expect(staggerItem.initial).toEqual({ opacity: 0, y: 10 });
      expect(staggerItem.animate).toEqual({ opacity: 1, y: 0 });
    });
  });

  describe('buttonTap props', () => {
    it('should have hover and tap scale effects', () => {
      expect(buttonTap.whileHover).toEqual({ scale: 1.05 });
      expect(buttonTap.whileTap).toEqual({ scale: 0.95 });
      expect(buttonTap.transition).toBeDefined();
    });
  });

  describe('buttonSubtle props', () => {
    it('should have subtle scale effects', () => {
      expect(buttonSubtle.whileHover).toEqual({ scale: 1.02 });
      expect(buttonSubtle.whileTap).toEqual({ scale: 0.98 });
    });
  });

  describe('spinnerRotate variant', () => {
    it('should have infinite rotation', () => {
      const animate = spinnerRotate.animate as {
        rotate: number;
        transition: { repeat: number };
      };
      expect(animate.rotate).toBe(360);
      expect(animate.transition.repeat).toBe(Infinity);
    });
  });

  describe('pulse variant', () => {
    it('should have pulsing scale and opacity', () => {
      const animate = pulse.animate as {
        scale: number[];
        opacity: number[];
        transition: { repeat: number };
      };
      expect(animate.scale).toEqual([1, 1.05, 1]);
      expect(animate.opacity).toEqual([1, 0.8, 1]);
      expect(animate.transition.repeat).toBe(Infinity);
    });
  });
});
