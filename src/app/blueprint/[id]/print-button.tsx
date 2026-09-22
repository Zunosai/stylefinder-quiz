'use client';

/**
 * Save-as-PDF affordance. Hidden when printing so it never lands in the PDF.
 */
export default function PrintButton() {
  return (
    <div className="mx-auto mt-6 max-w-3xl text-center print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
      >
        Save as PDF
      </button>
      <p className="mt-2 text-xs text-gray-500">
        Choose <span className="font-medium">Save as PDF</span> as the
        destination in the print dialog.
      </p>
    </div>
  );
}
