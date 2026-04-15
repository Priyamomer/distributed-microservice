ALTER TABLE price
    ADD CONSTRAINT uc_4860cfa093ac81fd8bfc40d1c UNIQUE (currency, amount);