alter type public.lead_status add value if not exists 'appointment' after 'qualified';
alter type public.lead_status add value if not exists 'negotiation' after 'proposal_sent';
