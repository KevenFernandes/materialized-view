CREATE TABLE itens_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10, 2) NOT NULL,
    
    -- Ligações (Foreign Keys)
    CONSTRAINT fk_itens_pedido_pedido 
        FOREIGN KEY (pedido_id) 
        REFERENCES pedidos (id) 
        ON DELETE CASCADE,

    CONSTRAINT fk_itens_pedido_produto 
        FOREIGN KEY (produto_id) 
        REFERENCES produtos (id) 
        ON DELETE RESTRICT
);

-- Índices recomendados para otimizar o JOIN da sua query
CREATE INDEX idx_itens_pedido_pedido_id ON itens_pedido(pedido_id);
CREATE INDEX idx_itens_pedido_produto_id ON itens_pedido(produto_id);
