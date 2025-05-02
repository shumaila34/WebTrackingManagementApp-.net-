using System.ComponentModel.DataAnnotations;

namespace Backend.DTO
{
    public class CreateTaskDto
    {

        [Required]
        public string Title { get; set; } = null!;

        [Required]
        public string Description { get; set; } = null!;

        [Required]
        public string Status { get; set; } = null!;

        [Required]
        public string Priority { get; set; } = null!;

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        public string Category { get; set; } = null!;

        public string? AssignedToUserId { get; set; }

        public TaskModel ToTaskModel(string userId)
        {
            return new TaskModel
            {
                Title = this.Title,
                Description = this.Description,
                Status = this.Status,
                Priority = this.Priority,
                DueDate = this.DueDate,
                Category = this.Category,
                AssignedToUserId = this.AssignedToUserId,
                CreatedByUserId = userId
            };
        }
    }
}
