using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;

namespace Backend.Controllers
{
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
                taskCounts = new
                {
                    Completed = _context.Tasks.Count(t => t.Status == "Completed" && t.UserId == userId),
                    InProgress = _context.Tasks.Count(t => t.Status == "InProgress" && t.UserId == userId),
                    Pending = _context.Tasks.Count(t => t.Status == "Pending" && t.UserId == userId)
                };
            }

            return Ok(new
            {
                role,
                taskCounts
            });
        }
    }
}
