-- ============================================================
-- akimax pet — Migración 0006: Función de decremento de stock
-- ============================================================

-- Disminuye el stock de un producto y registra el movimiento de inventario.
create or replace function public.decrement_stock(p_product_id integer, p_quantity integer)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  update public.products
  set stock = greatest(0, stock - p_quantity)
  where id = p_product_id;

  insert into public.inventory_movements (product_id, type, quantity, reason)
  values (p_product_id, 'Salida', -abs(p_quantity), 'Venta en caja');
end;
$$;

grant execute on function public.decrement_stock(integer, integer) to authenticated;