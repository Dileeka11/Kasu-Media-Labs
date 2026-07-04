<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $fillable = ['client_id', 'invoice_number', 'issue_date', 'due_date', 'status', 'total'];

    protected function casts(): array
    {
        return [
            'total' => 'float',
            'issue_date' => 'date:Y-m-d',
            'due_date' => 'date:Y-m-d',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public static function nextNumber(): string
    {
        $year = now()->format('Y');
        $last = static::where('invoice_number', 'like', "INV-{$year}-%")
            ->orderByDesc('invoice_number')
            ->value('invoice_number');
        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;

        return sprintf('INV-%s-%04d', $year, $seq);
    }
}
