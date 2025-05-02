using Backend.Data;
using Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[Route("api/[controller]")]
[ApiController]
[Authorize]  // Only authorized users can access this
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetDashboardData()
    {
        // Retrieve the user's role and userId from the claims
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // If role or userId is missing from the claims, return Unauthorized response
        if (string.IsNullOrEmpty(role) || string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "Invalid token data." });
        }

        // Initialize task counts with default values
        var taskCounts = new
        {
            Completed = 0,
            InProgress = 0,
            Pending = 0
        };

        // Logic for Admin role
        if (role == "Admin")
        {
            // Count tasks for all users (Admin sees all tasks)
            taskCounts = new
            {
                Completed = _context.Tasks.Count(t => t.Status == "Completed"),
                InProgress = _context.Tasks.Count(t => t.Status == "InProgress"),
                Pending = _context.Tasks.Count(t => t.Status == "Pending")
            };
        }
        // Logic for non-Admin users (based on userId)
        else
        {
            // Count tasks for the specific user based on CreatedByUserId or AssignedToUserId
            taskCounts = new
            {
                Completed = _context.Tasks.Count(t => t.Status == "Completed" && t.CreatedByUserId == userId),
                InProgress = _context.Tasks.Count(t => t.Status == "InProgress" && t.CreatedByUserId == userId),
                Pending = _context.Tasks.Count(t => t.Status == "Pending" && t.CreatedByUserId == userId)
            };
        }

        // Return the role and task counts as JSON response
        return Ok(new
        {
            role,
            taskCounts
        });
    }
}
