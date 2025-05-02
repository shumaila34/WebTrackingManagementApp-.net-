using Backend.DTO;
using Backend.Model;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Serilog;
using System.Linq;
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
        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var email = User.Identity?.Name; // Get the user's email from the current identity
                var user = await _userManager.FindByEmailAsync(email); // Fetch the user based on email

                if (user == null)
                {
                    _logger.LogWarning("User with email {Email} not found while fetching profile", email);
                    return NotFound("User not found");
                }

                var profile = new
                {
                    user.UserName,
                    user.Email,
                    user.PhoneNumber,
                    user.Id
                };

                _logger.LogInformation("Fetched profile for user {UserId}", user.Id); // Log successful profile fetch
                return Ok(profile);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching profile for user");
                return StatusCode(500, "Internal server error");
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
