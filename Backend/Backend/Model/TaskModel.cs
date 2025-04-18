namespace Backend.Model
{
    public class TaskModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string Priority { get; set; }  // Low, Medium, High
        public DateTime DueDate { get; set; }
        public string Category { get; set; }  // e.g., Work, Personal, etc.
        public string UserId { get; set; }

        // Add other properties as needed
    }


}
