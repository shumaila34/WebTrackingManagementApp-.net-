using Backend.DTO;
using Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace TaskManagementSystem.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ProfileController : ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(UserManager<Users> userManager, ILogger<ProfileController> logger)
        {
            _userManager = userManager;
            _logger = logger;
        }

        // 👤 GET: api/Profile
        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                // Step 1: Get userId from token claims
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("User ID not found in claims.");
                    return Unauthorized("User is not authenticated.");
                }

                // Step 2: Find user by ID
                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                {
                    _logger.LogWarning("User with ID {UserId} not found while fetching profile", userId);
                    return NotFound("User not found.");
                }

                // Step 3: Return profile data
                var profile = new
                {
                    user.UserName,
                    user.Email,
                    // Add other properties here if needed
                };

                _logger.LogInformation("Successfully fetched profile for user {UserId}", userId);
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching profile for user.");
                return StatusCode(500, "Internal server error.");
            }
        }



        // 🔐 PUT: api/Profile/change-password
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
        {
            // Validate the incoming request model
            if (!ModelState.IsValid)
            {
                return BadRequest("Invalid data.");
            }

            try
            {
                var email = User.Identity?.Name; // Get the logged-in user's email
                var user = await _userManager.FindByEmailAsync(email);

                if (user == null)
                {
                    _logger.LogWarning("User with email {Email} not found while attempting to change password", email);
                    return NotFound("User not found");
                }

                // Attempt to change the password
                var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);

                if (!result.Succeeded)
                {
                    _logger.LogWarning("Failed to change password for user {UserId}", user.Id);
                    return BadRequest(result.Errors.Select(e => e.Description));
                }

                _logger.LogInformation("Successfully changed password for user {UserId}", user.Id);
                return Ok("Password changed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while changing password for user");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
