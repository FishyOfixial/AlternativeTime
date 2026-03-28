import ErrorState from "../feedback/ErrorState";
import ClientSaleForm from "./ClientSaleForm";

export default function ClientActionsPanel({
  saleSuccess,
  saleError,
  isSaleFormOpen,
  onToggleSaleForm,
  onCreateSale,
  saleForm,
  onSaleFormChange,
  inventoryState,
  selectedItem,
  isCreatingSale,
  isDeleting,
  onDelete
}) {
  const isSaleDisabled =
    isCreatingSale ||
    inventoryState.status === "error" ||
    inventoryState.items.length === 0 ||
    !saleForm.product ||
    !saleForm.amount_paid;

  return (
    <section className="panel-surface p-6">
      <p className="font-serif text-2xl text-[#2a221b]">Acciones</p>

      {saleSuccess ? (
        <p className="mt-4 rounded-md border border-[#d9e5d7] bg-[#edf7ed] px-4 py-3 text-sm text-[#4c6d50]">
          {saleSuccess}
        </p>
      ) : null}

      {saleError ? (
        <div className="mt-4">
          <ErrorState message={saleError} title="No pudimos registrar la venta" />
        </div>
      ) : null}

      <button
        className="gold-button mt-4 w-full"
        onClick={onToggleSaleForm}
        type="button"
      >
        {isSaleFormOpen ? "Cerrar venta" : "+ Registrar nueva venta"}
      </button>

      {isSaleFormOpen ? (
        <ClientSaleForm
          inventoryItems={inventoryState.items}
          isDisabled={isSaleDisabled}
          isSubmitting={isCreatingSale}
          onChange={onSaleFormChange}
          onSubmit={onCreateSale}
          saleForm={saleForm}
          selectedItem={selectedItem}
        />
      ) : null}

      <button
        className="mt-4 w-full rounded-md border border-[#dec5bd] bg-[#fff4f1] px-4 py-3 text-sm text-[#8d5b4d] transition hover:bg-[#fbe9e4]"
        disabled={isDeleting}
        onClick={onDelete}
        type="button"
      >
        {isDeleting ? "Eliminando..." : "Eliminar cliente"}
      </button>
    </section>
  );
}
