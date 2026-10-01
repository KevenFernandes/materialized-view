-- 05_seed_data.sql

DO $$
DECLARE
    -- Variáveis para guardar os IDs dos produtos
    p_arroz_id UUID;
    p_feijao_id UUID;
    p_leite_id UUID;
    p_cafe_id UUID;
    p_açucar_id UUID;

    -- Variáveis para guardar os IDs dos pedidos
    pedido1_id UUID;
    pedido2_id UUID;
    pedido3_id UUID;
BEGIN
    -------------------------------------------------------------------
    -- 1. INSERIR PRODUTOS
    -------------------------------------------------------------------
    INSERT INTO produtos (nome, preco) 
    VALUES ('Arroz 5kg', 29.90) 
    RETURNING id INTO p_arroz_id;

    INSERT INTO produtos (nome, preco) 
    VALUES ('Feijão Carioca 1kg', 8.50) 
    RETURNING id INTO p_feijao_id;

    INSERT INTO produtos (nome, preco) 
    VALUES ('Leite Integral 1L', 5.20) 
    RETURNING id INTO p_leite_id;

    INSERT INTO produtos (nome, preco) 
    VALUES ('Café Torrado 500g', 16.90) 
    RETURNING id INTO p_cafe_id;

    INSERT INTO produtos (nome, preco) 
    VALUES ('Açúcar Refinado 1kg', 4.30) 
    RETURNING id INTO p_açucar_id;

    -------------------------------------------------------------------
    -- 2. INSERIR PEDIDOS
    -------------------------------------------------------------------
    INSERT INTO pedidos (status) 
    VALUES ('concluido') 
    RETURNING id INTO pedido1_id;

    INSERT INTO pedidos (status) 
    VALUES ('concluido') 
    RETURNING id INTO pedido2_id;

    INSERT INTO pedidos (status) 
    VALUES ('pendente') 
    RETURNING id INTO pedido3_id;

    -------------------------------------------------------------------
    -- 3. INSERIR ITENS DOS PEDIDOS
    -------------------------------------------------------------------
    -- Pedido 1
    INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
    VALUES 
        (pedido1_id, p_arroz_id, 2, 29.90),
        (pedido1_id, p_feijao_id, 3, 8.50),
        (pedido1_id, p_leite_id, 5, 5.20);

    -- Pedido 2
    INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
    VALUES 
        (pedido2_id, p_arroz_id, 1, 29.90),
        (pedido2_id, p_cafe_id, 2, 16.90);

    -- Pedido 3 (Pendente)
    INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
    VALUES 
        (pedido3_id, p_açucar_id, 4, 4.30);

    -------------------------------------------------------------------
    -- 4. POPOVAR A TABELA DE RESUMO DE VENDAS (Com dados consolidados)
    -------------------------------------------------------------------
    INSERT INTO mv_resumo_vendas_produtos (produto_id, produto_nome, total_pedidos, qtd_total_vendida, receita_total)
    VALUES
        (p_arroz_id, 'Arroz 5kg', 2, 3, 89.70),
        (p_feijao_id, 'Feijão Carioca 1kg', 1, 3, 25.50),
        (p_leite_id, 'Leite Integral 1L', 1, 5, 26.00),
        (p_cafe_id, 'Café Torrado 500g', 1, 2, 33.80),
        (p_açucar_id, 'Açúcar Refinado 1kg', 1, 4, 17.20);

END $$;