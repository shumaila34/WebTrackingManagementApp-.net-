using Backend.Data;
using Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Microsoft.AspNetCore.SignalR;
using Backend.Hubs;


namespace Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TaskController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<Users> _userManager;
        private readonly ILogger<TaskController> _logger;
        private readonly IHubContext<TaskHub> _hubContext;

        public TaskController(AppDbContext context, UserManager<Users> userManager, ILogger<TaskController> logger, IHubContext<TaskHub> hubContext)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _hubContext = hubContext;
        }

        // Get Tasks for current user or all if Admin
        [HttpGet]
        public async Task<IActionResult> GetTasks()
        {
            try
            {
                var userEmail = User.Identity?.Name;
                var user = await _userManager.FindByEmailAsync(userEmail);
                var roles = await _userManager.GetRolesAsync(user);

                IQueryable<TaskModel> query = _context.Tasks;

                if (!roles.Contains("Admin"))
                {
                    query = query.Where(t => t.UserId == user.Id);
                }

                var tasks = await query.ToListAsync();

                _logger.LogInformation("Successfully fetched tasks for user {UserId}", user.Id); // Log the successful fetch
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching tasks for user");
                return StatusCode(500, "Internal server error");
            }
        }

        // Get Task by ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);

                if (task == null)
                {
                    _logger.LogWarning("Task with ID {TaskId} not found", id); // Log warning if not found
                    return NotFound($"Task with ID {id} was not found");
                }

                _logger.LogInformation("Fetched task with ID {TaskId}", id); // Log successful fetch
                return Ok(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching task with ID {TaskId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // Create New Task
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] TaskModel task)
        {
            try
            {
                // Validate task fields
                if (string.IsNullOrWhiteSpace(task.Title))
                {
                    return BadRequest("Title is required.");
                }

                if (string.IsNullOrWhiteSpace(task.Description))
                {
                    return BadRequest("Description is required.");
                }

                var userEmail = User.Identity?.Name;
                var user = await _userManager.FindByEmailAsync(userEmail);

                task.UserId = user.Id;
                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created a new task for user {UserId} with title {TaskTitle}", user.Id, task.Title); // Log task creation
                return Ok(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a task for user {UserId}", task.UserId);
                return StatusCode(500, "Internal server error");
            }
        }

        // Update Existing Task
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] TaskModel updated)
        {
            try
            {
                // Validate task fields
                if (string.IsNullOrWhiteSpace(updated.Title))
                {
                    return BadRequest("Title is required.");
                }

                if (string.IsNullOrWhiteSpace(updated.Description))
                {
                    return BadRequest("Description is required.");
                }

                var task = await _context.Tasks.FindAsync(id);

                if (task == null)
                {
                    _logger.LogWarning("Task with ID {TaskId} not found for update", id); // Log warning if task not found
                    return NotFound($"Task with ID {id} was not found");
                }

                // Check if the user is authorized to update the task
                var userEmail = User.Identity?.Name;
                var user = await _userManager.FindByEmailAsync(userEmail);
                var roles = await _userManager.GetRolesAsync(user);

                if (task.UserId != user.Id && !roles.Contains("Admin"))
                {
                    return Unauthorized("You cannot modify this task.");
                }

                task.Title = updated.Title;
                task.Description = updated.Description;
                task.Status = updated.Status;
                task.Priority = updated.Priority;
                task.DueDate = updated.DueDate;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Updated task with ID {TaskId} for user {UserId}", id, task.UserId); // Log task update
                return Ok(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating task with ID {TaskId}", id);
                return StatusCode(500, "Internal server error");
            }
        }

        // Delete Task
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            try
            {
                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                {
                    _logger.LogWarning("Task with ID {TaskId} not found for deletion", id); // Log warning if not found
                    return NotFound($"Task with ID {id} was not found");
                }

                // Check if the user is authorized to delete the task
                var userEmail = User.Identity?.Name;
                var user = await _userManager.FindByEmailAsync(userEmail);
                var roles = await _userManager.GetRolesAsync(user);

                if (task.UserId != user.Id && !roles.Contains("Admin"))
                {
                    return Unauthorized("You cannot delete this task.");
                }

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Deleted task with ID {TaskId} for user {UserId}", id, task.UserId); // Log task deletion
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting task with ID {TaskId}", id);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
