"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Plus, UserPlus } from "lucide-react";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/states/LoadingState";
import { EmptyState } from "@/components/states/EmptyState";
import { ErrorState } from "@/components/states/ErrorState";

export interface ProfessionalDTO {
  id: string;
  nome: string;
  slugInterno: string;
  ativo: boolean;
  billingMode: string;
  temAsaasProprio: boolean;
  asaasKeyLast4?: string;
}

const QUERY_KEY = ["professionals"] as const;

async function fetchProfessionals(): Promise<ProfessionalDTO[]> {
  const res = await fetch("/api/professionals");
  if (!res.ok) throw new Error("Falha ao carregar profissionais.");
  const json = await res.json();
  return json.professionals as ProfessionalDTO[];
}

export default function ProfessionalsList({
  initial,
  billingEnabled,
}: {
  initial: ProfessionalDTO[];
  billingEnabled: boolean;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchProfessionals,
    initialData: initial,
  });

  const items = data ?? [];
  const activeCount = items.filter((p) => p.ativo).length;

  const toggle = useMutation({
    mutationFn: async (p: ProfessionalDTO) => {
      const res = await fetch(`/api/professionals/${p.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ativo: !p.ativo }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Não foi possível atualizar.");
      }
      return { ...p, ativo: !p.ativo };
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast(updated.ativo ? "Profissional ativado." : "Profissional desativado.");
    },
    onError: (e: Error) => toast(e.message, "error"),
  });

  const columns = useMemo<ColumnDef<ProfessionalDTO>[]>(() => {
    const cols: ColumnDef<ProfessionalDTO>[] = [
      {
        accessorKey: "nome",
        header: "Profissional",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/profissionais/${row.original.id}`}
            className="block min-w-0"
          >
            <span className="block truncate font-medium text-foreground">
              {row.original.nome}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              /{row.original.slugInterno}
            </span>
          </Link>
        ),
      },
    ];

    if (billingEnabled) {
      cols.push({
        id: "billing",
        header: "Faturamento",
        cell: ({ row }) =>
          row.original.temAsaasProprio ? (
            <Badge variant="secondary" className="font-medium text-primary">
              Próprio ····{row.original.asaasKeyLast4 ?? ""}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              Padrão do negócio
            </Badge>
          ),
      });
    }

    cols.push({
      id: "ativo",
      header: "Ativo",
      cell: ({ row }) => {
        const p = row.original;
        const isLastActive = p.ativo && activeCount === 1;
        return (
          <div className="flex items-center justify-end">
            <Switch
              checked={p.ativo}
              disabled={toggle.isPending || isLastActive}
              onCheckedChange={() => toggle.mutate(p)}
              aria-label={p.ativo ? "Desativar" : "Ativar"}
              title={
                isLastActive
                  ? "Todo negócio precisa de ao menos um profissional ativo."
                  : undefined
              }
            />
          </div>
        );
      },
    });

    return cols;
  }, [billingEnabled, activeCount, toggle]);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profissionais</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie quem atende no seu negócio e o faturamento de cada um.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/profissionais/novo">
            <Plus className="h-4 w-4" /> Adicionar
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Nenhum profissional ainda"
          description="Cadastre o primeiro profissional para começar a usar a agenda e o faturamento."
          action={
            <Button asChild>
              <Link href="/dashboard/profissionais/novo">
                <Plus className="h-4 w-4" /> Adicionar profissional
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={header.id === "ativo" ? "text-right" : ""}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={isFetching ? "fetching" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.id === "ativo" ? "text-right" : ""}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
