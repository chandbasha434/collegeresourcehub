import ResourceCard from '../ResourceCard';

const mockResource = {
  id: "1",
  title: "Advanced Calculus Notes - Chapter 7",
  description: "Comprehensive notes covering differential equations and integration techniques with detailed examples and practice problems",
  subject: "Mathematics",
  semester: "Fall 2024",
  fileType: "PDF",
  rating: 4.9,
  downloads: 234,
  uploadedBy: "Sarah Chen",
  uploadedAt: "2 hours ago",
};

export default function ResourceCardExample() {
  return <ResourceCard resource={mockResource} />;
}