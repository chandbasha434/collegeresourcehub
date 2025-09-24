import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, X, Star } from "lucide-react";

const subjects = [
  "All Subjects", "Mathematics", "Computer Science", "Physics", "Chemistry", 
  "Biology", "Economics", "Psychology", "History", "Literature", "Engineering"
];

const semesters = [
  "All Semesters", "Fall 2024", "Spring 2024", "Fall 2023", "Spring 2023", "Fall 2022", "Spring 2022"
];

const fileTypes = [
  { id: "pdf", label: "PDF" },
  { id: "doc", label: "Word Documents" },
  { id: "img", label: "Images" },
  { id: "ppt", label: "Presentations" },
];

const ratings = [
  { value: "all", label: "All Ratings" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
];

interface SearchFiltersProps {
  onSearch?: (filters: any) => void;
}

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    query: "",
    subject: "All Subjects",
    semester: "All Semesters",
    fileTypes: [] as string[],
    minRating: "all",
    sortBy: "relevance",
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    console.log("Search with filters:", filters);
    onSearch?.(filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: "",
      subject: "All Subjects",
      semester: "All Semesters",
      fileTypes: [],
      minRating: "all",
      sortBy: "relevance",
    };
    setFilters(clearedFilters);
    onSearch?.(clearedFilters);
  };

  const toggleFileType = (fileType: string) => {
    setFilters({
      ...filters,
      fileTypes: filters.fileTypes.includes(fileType)
        ? filters.fileTypes.filter(t => t !== fileType)
        : [...filters.fileTypes, fileType]
    });
  };

  const activeFiltersCount = [
    filters.subject !== "All Subjects" ? 1 : 0,
    filters.semester !== "All Semesters" ? 1 : 0,
    filters.fileTypes.length,
    filters.minRating !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for notes, papers, guides..."
                className="pl-10"
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                data-testid="input-search"
              />
            </div>
            <Button onClick={handleSearch} data-testid="button-search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              data-testid="button-toggle-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 min-w-5 rounded-full text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Advanced Filters</CardTitle>
                <CardDescription>Refine your search results</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select 
                  value={filters.subject} 
                  onValueChange={(value) => setFilters({ ...filters, subject: value })}
                >
                  <SelectTrigger data-testid="select-filter-subject">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Semester</Label>
                <Select 
                  value={filters.semester} 
                  onValueChange={(value) => setFilters({ ...filters, semester: value })}
                >
                  <SelectTrigger data-testid="select-filter-semester">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester} value={semester}>
                        {semester}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>File Types</Label>
              <div className="flex flex-wrap gap-3">
                {fileTypes.map((fileType) => (
                  <div key={fileType.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={fileType.id}
                      checked={filters.fileTypes.includes(fileType.id)}
                      onCheckedChange={() => toggleFileType(fileType.id)}
                      data-testid={`checkbox-${fileType.id}`}
                    />
                    <Label htmlFor={fileType.id} className="text-sm cursor-pointer">
                      {fileType.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Rating</Label>
                <Select 
                  value={filters.minRating} 
                  onValueChange={(value) => setFilters({ ...filters, minRating: value })}
                >
                  <SelectTrigger data-testid="select-min-rating">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ratings.map((rating) => (
                      <SelectItem key={rating.value} value={rating.value}>
                        <div className="flex items-center space-x-1">
                          <span>{rating.label}</span>
                          {rating.value !== "all" && (
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                >
                  <SelectTrigger data-testid="select-sort-by">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="downloads">Most Downloaded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={clearFilters} data-testid="button-reset-filters">
                Reset
              </Button>
              <Button onClick={handleSearch} data-testid="button-apply-filters">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.subject !== "All Subjects" && (
            <Badge variant="secondary" className="flex items-center gap-1" data-testid="active-filter-subject">
              Subject: {filters.subject}
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 p-0"
                onClick={() => setFilters({ ...filters, subject: "All Subjects" })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.semester !== "All Semesters" && (
            <Badge variant="secondary" className="flex items-center gap-1" data-testid="active-filter-semester">
              Semester: {filters.semester}
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 p-0"
                onClick={() => setFilters({ ...filters, semester: "All Semesters" })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
          {filters.fileTypes.map((fileType) => (
            <Badge key={fileType} variant="secondary" className="flex items-center gap-1" data-testid={`active-filter-filetype-${fileType}`}>
              {fileTypes.find(f => f.id === fileType)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 p-0"
                onClick={() => toggleFileType(fileType)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          {filters.minRating !== "all" && (
            <Badge variant="secondary" className="flex items-center gap-1" data-testid="active-filter-rating">
              {ratings.find(r => r.value === filters.minRating)?.label}
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 p-0"
                onClick={() => setFilters({ ...filters, minRating: "all" })}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}