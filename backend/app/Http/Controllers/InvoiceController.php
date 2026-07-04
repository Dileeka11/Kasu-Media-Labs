<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Invoice::with(['client', 'items'])->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $invoice = DB::transaction(function () use ($data) {
            $invoice = Invoice::create([
                'client_id' => $data['client_id'],
                'invoice_number' => Invoice::nextNumber(),
                'issue_date' => $data['issue_date'],
                'due_date' => $data['due_date'],
                'status' => $data['status'],
                'total' => $this->total($data['items']),
            ]);
            $invoice->items()->createMany($data['items']);

            return $invoice;
        });

        return response()->json($invoice->load(['client', 'items']), 201);
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $data = $this->validated($request);

        DB::transaction(function () use ($invoice, $data) {
            $invoice->update([
                'client_id' => $data['client_id'],
                'issue_date' => $data['issue_date'],
                'due_date' => $data['due_date'],
                'status' => $data['status'],
                'total' => $this->total($data['items']),
            ]);
            $invoice->items()->delete();
            $invoice->items()->createMany($data['items']);
        });

        return response()->json($invoice->load(['client', 'items']));
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();

        return response()->json(['message' => 'Invoice deleted.']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['required', 'date', 'after_or_equal:issue_date'],
            'status' => ['required', 'in:draft,sent,paid,overdue'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.description' => ['required', 'string', 'max:255'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ]);
    }

    private function total(array $items): float
    {
        return collect($items)->sum(fn (array $item) => $item['quantity'] * $item['unit_price']);
    }
}
