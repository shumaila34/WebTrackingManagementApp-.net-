using Backend.Model;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

public class TaskModel
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; }

    [Required]
    public string Description { get; set; }

    [Required]
    public string Status { get; set; }

    [Required]
    public string Priority { get; set; }

    [Required]
    public DateTime DueDate { get; set; }

    [Required]
    public string Category { get; set; }

    // Assigned To
    public string  AssignedToUserId { get; set; }  // Changed to non-nullable if required
    [ForeignKey("AssignedToUserId")]
    [BindNever]
    public Users AssignedToUser { get; set; }

    // Created By
    public string CreatedByUserId { get; set; }  // Changed to non-nullable if required
    [ForeignKey("CreatedByUserId")]
    [BindNever]
    public  Users CreatedByUser { get; set; }
}
