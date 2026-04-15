ALTER TABLE category
    ADD CONSTRAINT uc_category_name UNIQUE (name);