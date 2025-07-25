-- Add foreign key constraint for associated_entity_transactions
ALTER TABLE public.associated_entity_transactions 
ADD CONSTRAINT fk_associated_entity_transactions_entity_id 
FOREIGN KEY (associated_entity_id) REFERENCES public.associated_entities(id) ON DELETE CASCADE;