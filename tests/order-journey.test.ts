import { describe, expect, it } from 'vitest';

import {
  actionPriority,
  isActionable,
  isActiveOrder,
  ORDER_JOURNEY_STAGES,
  orderJourney,
  orderNextAction,
  type OrderStatus,
} from '@/lib/orders/journey';
import { orderStatusLabel } from '@/lib/orders/presentation';
import { Constants } from '@/lib/supabase/database.types';

const ALL_STATUSES = Constants.public.Enums.order_status as readonly OrderStatus[];

describe('order presentation vocabulary stays in sync with the enum', () => {
  it('maps every order_status to a non-raw Turkish label', () => {
    for (const status of ALL_STATUSES) {
      const label = orderStatusLabel(status);
      // A leak would return the raw enum string back to the customer.
      expect(label).not.toBe(status);
      expect(label.length).toBeGreaterThan(1);
    }
  });
});

describe('orderJourney stage derivation', () => {
  it('marks payment complete and design current once paid', () => {
    const states = orderJourney('paid').stages.map((stage) => stage.state);
    // payment, design, proof
    expect(states.slice(0, 3)).toEqual(['complete', 'current', 'upcoming']);
  });

  it('puts proof stage as current while awaiting approval', () => {
    const { stages, currentIndex } = orderJourney('proof_sent');
    const states = stages.map((stage) => stage.state);
    expect(states.slice(0, 3)).toEqual(['complete', 'complete', 'current']);
    expect(currentIndex).toBe(2);
  });

  it('advances proof to complete and production current after approval', () => {
    const states = orderJourney('proof_approved').stages.map((stage) => stage.state);
    // proof complete, production current
    expect(states.slice(2, 4)).toEqual(['complete', 'current']);
  });

  it('completes every stage for a completed order', () => {
    const { stages } = orderJourney('completed');
    expect(stages.every((stage) => stage.state === 'complete')).toBe(true);
  });

  it('treats cancelled/refunded as terminal with a halted tail', () => {
    for (const status of ['cancelled', 'refunded'] as const) {
      const journey = orderJourney(status);
      expect(journey.isTerminal).toBe(true);
      expect(journey.terminal).toBe(status);
      expect(journey.currentIndex).toBe(-1);
      expect(journey.stages.every((stage) => stage.state !== 'current')).toBe(true);
    }
  });

  it('produces a state for every stage on every status (no gaps)', () => {
    for (const status of ALL_STATUSES) {
      const { stages } = orderJourney(status);
      expect(stages).toHaveLength(ORDER_JOURNEY_STAGES.length);
      expect(
        stages.every((stage) =>
          ['complete', 'current', 'upcoming', 'halted'].includes(stage.state),
        ),
      ).toBe(true);
    }
  });
});

describe('orderNextAction derivation', () => {
  it('asks the customer to act only when it is their move', () => {
    expect(orderNextAction({ status: 'proof_sent', order_number: 'CD-1' }).tone).toBe('action');
    expect(orderNextAction({ status: 'pending_payment', order_number: 'CD-1' }).tone).toBe(
      'action',
    );
    expect(orderNextAction({ status: 'in_production', order_number: 'CD-1' }).tone).toBe(
      'progress',
    );
  });

  it('points the proof CTA at the proof anchor of the order', () => {
    const action = orderNextAction({ status: 'proof_sent', order_number: 'CD 42/1' });
    expect(action.cta?.href).toBe('/hesap/siparisler/CD%2042%2F1#prova');
  });

  it('celebrates delivery and halts on cancellation', () => {
    expect(orderNextAction({ status: 'delivered', order_number: 'CD-1' }).tone).toBe('success');
    expect(orderNextAction({ status: 'cancelled', order_number: 'CD-1' }).tone).toBe('halted');
    expect(orderNextAction({ status: 'refunded', order_number: 'CD-1' }).tone).toBe('halted');
  });

  it('returns a defined action for every enum status', () => {
    for (const status of ALL_STATUSES) {
      const action = orderNextAction({ status, order_number: 'CD-1' });
      expect(action.title.length).toBeGreaterThan(1);
      expect(action.description.length).toBeGreaterThan(1);
    }
  });
});

describe('dominant-order ranking', () => {
  it('ranks a proof awaiting approval above everything else', () => {
    expect(actionPriority('proof_sent')).toBeGreaterThan(actionPriority('pending_payment'));
    expect(actionPriority('pending_payment')).toBeGreaterThan(actionPriority('shipped'));
    expect(actionPriority('shipped')).toBeGreaterThan(actionPriority('in_production'));
    expect(actionPriority('in_production')).toBeGreaterThan(actionPriority('delivered'));
    expect(actionPriority('delivered')).toBeGreaterThan(actionPriority('cancelled'));
  });

  it('classifies actionable and active states correctly', () => {
    expect(isActionable('proof_sent')).toBe(true);
    expect(isActionable('in_production')).toBe(false);
    expect(isActiveOrder('in_production')).toBe(true);
    expect(isActiveOrder('delivered')).toBe(false);
    expect(isActiveOrder('cancelled')).toBe(false);
  });
});
