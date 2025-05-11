using Backend.Data;
using Backend.DTO;
using Backend.Hubs;
using Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System.Security.Claims;

namespace Backend.Controllers
{
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

        public class TaskDto
        {
            public int Id { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Status { get; set; }
            public string Priority { get; set; }
            public DateTime DueDate { get; set; }
            public string Category { get; set; }
            public string UserName { get; set; }
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetTasks()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var user = await _userManager.FindByIdAsync(userId);
                var roles = await _userManager.GetRolesAsync(user);

                IQueryable<TaskModel> query = _context.Tasks.Include(t => t.CreatedByUser);

                if (!roles.Contains("Admin"))
                {
                    query = query.Where(t => t.CreatedByUserId == userId);
                }

                var tasks = await query.ToListAsync();

                var taskDtos = tasks.Select(t => new TaskDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status,
                    Priority = t.Priority,
                    DueDate = t.DueDate,
                    Category = t.Category,
                    UserName = t.CreatedByUser?.UserName ?? "Unknown"
                }).ToList();

                _logger.LogInformation("Successfully fetched tasks for user {UserId}", user.Id);
                return Ok(taskDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching tasks");
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTask(int id)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var user = await _userManager.FindByIdAsync(userId);
                var roles = await _userManager.GetRolesAsync(user);

                var task = await _context.Tasks.Include(t => t.CreatedByUser)
                                               .FirstOrDefaultAsync(t => t.Id == id);

                if (task == null)
                    return NotFound($"Task with ID {id} was not found");

                if (!roles.Contains("Admin") && task.CreatedByUserId != userId)
                {
                    return Forbid(); // Or NotFound()
                }

                var taskDto = new TaskDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    Status = task.Status,
                    Priority = task.Priority,
                    DueDate = task.DueDate,
                    Category = task.Category,
                    UserName = task.CreatedByUser?.UserName ?? "Unknown"
                };

                return Ok(taskDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching task with ID {TaskId}", id);
                return StatusCode(500, "Internal server error");
            }
        }




        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskDto model)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User is not authenticated.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return Unauthorized("User not found.");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);
                var task = model.ToTaskModel(userId);

                if (!string.IsNullOrEmpty(model.AssignedToUserId))
                {
                    var assignedUser = await _userManager.FindByIdAsync(model.AssignedToUserId);
                    if (assignedUser == null)
                        return BadRequest("Assigned user not found.");
                }
                else
                    task.AssignedToUserId = userId;

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                await _hubContext.Clients.All.SendAsync("TaskCreated", model);

                _logger.LogInformation("Task created by user {UserId}", user.Id);
                return CreatedAtAction(nameof(GetTask), new { id = task.Id }, model);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating the task.");
                return StatusCode(500, "Internal server error");
            }
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskDto updated)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized("User is not authenticated.");

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return Unauthorized("User not found.");

                var task = await _context.Tasks.FindAsync(id);
                if (task == null)
                    return NotFound($"Task with ID {id} not found");

                var roles = await _userManager.GetRolesAsync(user);
                if (task.CreatedByUserId != user.Id && !roles.Contains("Admin"))
                    return Unauthorized("You are not authorized to update this task.");

                // Update only the allowed fields
                task.Title = updated.Title;
                task.Description = updated.Description;
                task.Status = updated.Status;
                task.Priority = updated.Priority;
                task.DueDate = updated.DueDate;
                task.Category = updated.Category;

                await _context.SaveChangesAsync();

                _logger.LogInformation("Task with ID {TaskId} updated by user {UserId}", id, user.Id);

                return Ok(task);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating the task.");
                return StatusCode(500, "Internal server error");
            }
        }

        

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound($"Task with ID {id} was not found");

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userManager.FindByIdAsync(userId);
            var roles = await _userManager.GetRolesAsync(user);

            if (task.CreatedByUserId != userId && !roles.Contains("Admin"))
                return Forbid();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        public class UserSelectDto
        {
            public string Text { get; set; }
            public string Value { get; set; }


        }

        [HttpGet("user-select-list")]
        public async Task<IActionResult> GetUserSelectList()
        {
            var users = _context.Users.Select(u => new UserSelectDto
            {
                Text = u.UserName!,
                Value = u.Id
            }).ToList();

            return Ok(users);
        }



    }
}
