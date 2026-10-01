-- Tabela de leitura otimizada (Materialized View manual)
CREATE TABLE mv_resumo_vendas_produtos (
    produto_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_nome VARCHAR(255) NOT NULL,
    total_pedidos INT NOT NULL,
    qtd_total_vendida INT NOT NULL,
    receita_total DECIMAL(10, 2) NOT NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);