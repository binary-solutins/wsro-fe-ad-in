import { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Competition } from "../types";
import CompetitionModal from "./CompetitionModal";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

export default function CompetitionList() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [competitionToDelete, setCompetitionToDelete] = useState<Competition | null>(null);
  const columnHelper = createColumnHelper<Competition>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <div className="font-medium text-gray-900">{info.getValue()}</div>
        ),
      }),
      columnHelper.accessor("level", {
        header: "Level",
        cell: (info) => (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => (
          <span className="text-gray-700">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.accessor("venue", {
        header: "Venue",
        cell: (info) => (
          <div
            className="max-w-xs truncate text-gray-700"
            title={info.getValue()}
          >
            {info.getValue()}
          </div>
        ),
      }),
      columnHelper.accessor("registration_deadline", {
        header: "Registration Deadline",
        cell: (info) => (
          <span className="text-gray-700">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        ),
      }),
      columnHelper.accessor("maximum_teams", {
        header: "Max Teams",
        cell: (info) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 font-medium">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("fees", {
        header: "Fees",
        cell: (info) => (
          <span className="font-medium text-emerald-600">
            ${info.getValue()}
          </span>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setSelectedCompetition(info.row.original);
                setIsModalOpen(true);
              }}
              className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCompetitionToDelete(info.row.original);
                setIsDeleteModalOpen(true);
              }}
              className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: competitions,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const handleAddEdit = async (competition: Competition) => {
    try {
      const isEditing = Boolean(competition.id);
      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/competitions/${competition.id}`
        : `${import.meta.env.VITE_API_URL}/competitions/new`;

      // Create FormData object
      const formData = new FormData();
      
      // Append all competition data to FormData
      Object.keys(competition).forEach(key => {
        if (key === 'id') return; // Skip id field for FormData
        
        if (key === 'date' || key === 'registration_deadline') {
          // Format dates properly
          formData.append(key, new Date(competition[key]).toISOString().split('T')[0]);
        } else if (key === 'pdf' && competition[key] instanceof File) {
          // Handle PDF file
          formData.append('pdf', competition[key]);
        } else {
          formData.append(key, competition[key].toString());
        }
      });

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? "update" : "create"} competition`);
      }

      toast.success(
        `Competition ${isEditing ? "updated" : "created"} successfully`
      );
      setIsModalOpen(false);
      fetchCompetitions();
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error ? error.message : `Failed to ${competition.id ? "update" : "create"} competition`
      );
    }
  };

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/competitions`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch competitions");
      const data = await response.json();
      setCompetitions(data);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to fetch competitions");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/competitions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          toast.error(
            "Access denied: Only administrators can delete competitions"
          );
        } else if (response.status === 404) {
          toast.error("Competition not found");
        } else {
          throw new Error("Failed to delete competition");
        }
      } else {
        const data = await response.json();
        toast.success(data.message);
        fetchCompetitions();
      }
    } catch (error) {
      toast.error("Failed to delete competition");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Competitions
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search competitions..."
                className="pl-9 pr-4 py-2.5 w-full sm:w-72 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 hover:border-indigo-300"
              />
            </div>
            <button
              onClick={() => {
                setSelectedCompetition(null);
                setIsModalOpen(true);
              }}
              className="flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md w-full sm:w-auto justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Competition
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="bg-gray-50">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center space-x-1">
                          <span>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getIsSorted() && (
                            <span className="text-indigo-500">
                              {header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center"
                    >
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 text-sm">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Search className="w-12 h-12 text-gray-300 mb-2" />
                        <p className="text-gray-600 font-medium">
                          No competitions found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your search or add a new competition
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Section */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-gray-50">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex gap-x-4 items-center">
                <span className="text-sm text-gray-700">
                  Page{" "}
                  <span className="font-medium">
                    {table.getState().pagination.pageIndex + 1}
                  </span>{" "}
                  of <span className="font-medium">{table.getPageCount()}</span>
                </span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="form-select rounded-lg border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-x-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CompetitionModal
          competition={selectedCompetition}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddEdit}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCompetitionToDelete(null);
          }}
          onConfirm={() => {
            if (competitionToDelete?.id) {
              handleDelete(competitionToDelete.id);
            }
          }}
        />
      )}
    </div>
  );
}