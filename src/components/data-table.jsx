
import * as React from "react"

import {
  columnVisibilityFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"

import { restrictToVerticalAxis } from "@dnd-kit/modifiers"

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  GripVerticalIcon,
  CircleCheckIcon,
  LoaderIcon,
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  PlusIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
} from "lucide-react"

// ==========================================
// TANSTACK TABLE V9 FEATURES
// ==========================================

const features = tableFeatures({
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,

  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

const columnHelper = createColumnHelper()

// ==========================================
// DRAG HANDLE
// ==========================================

function DragHandle({ id }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-4" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// ==========================================
// COLUMNS
// ==========================================

const columns = columnHelper.columns([

  // DRAG
  columnHelper.display({
    id: "drag",
    header: () => null,
    cell: ({ row }) => (
      <DragHandle id={row.original.id.toString()} />
    ),
  }),

  // CHECKBOX SELECT ALL
  columnHelper.display({
    id: "select",

    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          indeterminate={
            table.getIsSomePageRowsSelected() &&
            !table.getIsAllPageRowsSelected()
          }
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(value)
          }}
          aria-label="Select all rows"
        />
      </div>
    ),

    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value)
          }}
          aria-label="Select row"
        />
      </div>
    ),

    enableSorting: false,
    enableHiding: false,
  }),

  // HEADER
  columnHelper.accessor("header", {
    header: "Header",
    enableHiding: false,

    cell: ({ getValue }) => (
      <span className="font-medium">
        {getValue()}
      </span>
    ),
  }),

  // TYPE
  columnHelper.accessor("type", {
    header: "Section Type",

    cell: ({ getValue }) => (
      <Badge
        variant="outline"
        className="px-1.5 text-muted-foreground"
      >
        {getValue()}
      </Badge>
    ),
  }),

  // STATUS
  columnHelper.accessor("status", {
    header: "Status",

    cell: ({ getValue }) => {
      const status = getValue()

      return (
        <Badge
          variant="outline"
          className="gap-1 px-1.5 text-muted-foreground"
        >
          {status === "Done" ? (
            <CircleCheckIcon className="size-3 text-green-500" />
          ) : (
            <LoaderIcon className="size-3" />
          )}

          {status}
        </Badge>
      )
    },
  }),

  // TARGET
  columnHelper.accessor("target", {
    header: () => (
      <div className="text-right">Target</div>
    ),

    cell: ({ row, table }) => (
      <Input
        className="h-8 w-20 text-right"
        defaultValue={row.original.target}
        onBlur={(event) => {
          table.options.meta?.updateData(
            row.original.id,
            "target",
            event.target.value
          )
        }}
      />
    ),
  }),

  // LIMIT
  columnHelper.accessor("limit", {
    header: () => (
      <div className="text-right">Limit</div>
    ),

    cell: ({ row, table }) => (
      <Input
        className="h-8 w-20 text-right"
        defaultValue={row.original.limit}
        onBlur={(event) => {
          table.options.meta?.updateData(
            row.original.id,
            "limit",
            event.target.value
          )
        }}
      />
    ),
  }),

  // REVIEWER
  columnHelper.accessor("reviewer", {
    header: "Reviewer",

    cell: ({ row, table }) => (
      <Select
        value={row.original.reviewer}
        onValueChange={(value) => {
          table.options.meta?.updateData(
            row.original.id,
            "reviewer",
            value
          )
        }}
        items={[
          { label: "Assign reviewer", value: "Assign reviewer" },
          { label: "Eddie Lake", value: "Eddie Lake" },
          { label: "Jamik Tashpulatov", value: "Jamik Tashpulatov" },
          { label: "Emily Whalen", value: "Emily Whalen" },
        ]}
      >
        <SelectTrigger className="w-40" size="sm">
          <SelectValue placeholder="Assign reviewer" />
        </SelectTrigger>

        <SelectContent>
          <SelectGroup>
            <SelectItem value="Assign reviewer">
              Assign reviewer
            </SelectItem>
            <SelectItem value="Eddie Lake">
              Eddie Lake
            </SelectItem>
            <SelectItem value="Jamik Tashpulatov">
              Jamik Tashpulatov
            </SelectItem>
            <SelectItem value="Emily Whalen">
              Emily Whalen
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    ),
  }),

  // ACTIONS
  columnHelper.display({
    id: "actions",

    cell: ({ row, table }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
            />
          }
        >
          <EllipsisVerticalIcon className="size-4" />
          <span className="sr-only">Open menu</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-36">

          <DropdownMenuItem
            onClick={() => {
              toast.info(`Edit: ${row.original.header}`)
            }}
          >
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(
                JSON.stringify(row.original, null, 2)
              )
              toast.success("Row copied")
            }}
          >
            Make a copy
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              table.options.meta?.deleteRow(row.original.id)
            }}
          >
            Delete
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    ),
  }),

])

// ==========================================
// DRAGGABLE ROW
// ==========================================

function DraggableRow({ row, table }) {
  const {
    transform,
    transition,
    setNodeRef,
    isDragging,
  } = useSortable({
    id: row.original.id.toString(),
  })

  return (
    <TableRow
      ref={setNodeRef}
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          <table.FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  )
}

// ==========================================
// MAIN DATA TABLE
// ==========================================

export function DataTable({ data: initialData = [] }) {

  const [data, setData] = React.useState(initialData)

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [sorting, setSorting] = React.useState([])

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  React.useEffect(() => {
    setData(initialData)
  }, [initialData])

  // DRAG SENSORS
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  )

  const dataIds = React.useMemo(
    () => data.map((item) => item.id.toString()),
    [data]
  )

  // TABLE INSTANCE
  const table = useTable({

    features,

    data,
    columns,

    getRowId: (row) => row.id.toString(),

    enableRowSelection: true,

    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },

    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,

    meta: {
      updateData: (id, columnId, value) => {
        setData((previous) =>
          previous.map((item) =>
            item.id === id
              ? { ...item, [columnId]: value }
              : item
          )
        )
      },

      deleteRow: (id) => {
        setData((previous) =>
          previous.filter((item) => item.id !== id)
        )

        setRowSelection((previous) => {
          const next = { ...previous }
          delete next[id.toString()]
          return next
        })

        toast.success("Row deleted")
      },
    },
  })

  // DRAG END
  function handleDragEnd(event) {
    const { active, over } = event

    if (!over || active.id === over.id) return

    setData((previous) => {
      const oldIndex = previous.findIndex(
        (item) => item.id.toString() === active.id
      )

      const newIndex = previous.findIndex(
        (item) => item.id.toString() === over.id
      )

      if (oldIndex === -1 || newIndex === -1) {
        return previous
      }

      return arrayMove(previous, oldIndex, newIndex)
    })
  }

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="flex w-full flex-col gap-4">

      {/* TOOLBAR */}

      <div className="flex items-center justify-between px-4 lg:px-6">

        <div className="flex items-center gap-2">

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" />
              }
            >
              <Columns3Icon className="mr-2 size-4" />
              Columns
              <ChevronDownIcon className="ml-2 size-4" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">

              {table.getAllColumns()
                .filter(
                  (column) =>
                    column.getCanHide() &&
                    typeof column.accessorFn !== "undefined"
                )
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}

            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Add section")}
          >
            <PlusIcon className="mr-2 size-4" />
            <span className="hidden lg:inline">
              Add Section
            </span>
          </Button>

        </div>
      </div>

      {/* TABLE */}

      <div className="mx-4 overflow-x-auto rounded-lg border lg:mx-6">

        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >

          <Table>

            <TableHeader className="sticky top-0 z-10 bg-muted">

              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>

                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder
                        ? null
                        : <table.FlexRender header={header} />
                      }
                    </TableHead>
                  ))}

                </TableRow>
              ))}

            </TableHeader>

            <TableBody>

              {table.getRowModel().rows.length > 0 ? (

                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >

                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow
                      key={row.id}
                      row={row}
                      table={table}
                    />
                  ))}

                </SortableContext>

              ) : (

                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>

              )}

            </TableBody>

          </Table>

        </DndContext>

      </div>

      {/* PAGINATION */}

      <div className="flex items-center justify-between px-4 lg:px-6">

        <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>

        <div className="flex w-full items-center gap-4 lg:w-fit">

          <div className="hidden items-center gap-2 lg:flex">

            <span className="text-sm font-medium">
              Rows per page
            </span>

            <Select
              value={`${table.state.pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
              items={[10, 20, 30, 40, 50].map((size) => ({
                label: `${size}`,
                value: `${size}`,
              }))}
            >
              <SelectTrigger size="sm" className="w-20">
                <SelectValue />
              </SelectTrigger>

              <SelectContent side="top">
                <SelectGroup>
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

          </div>

          <div className="text-sm font-medium">
            Page {table.state.pagination.pageIndex + 1} of{" "}
            {Math.max(table.getPageCount(), 1)}
          </div>

          <div className="flex items-center gap-2">

            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeftIcon className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeftIcon className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRightIcon className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="hidden size-8 lg:flex"
              onClick={() =>
                table.setPageIndex(table.getPageCount() - 1)
              }
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRightIcon className="size-4" />
            </Button>

          </div>
        </div>
      </div>

    </div>
  )
}
