


using Backend.Model;
using Backend.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<Users> _userManager;
        private readonly SignInManager<Users> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AuthController(
            UserManager<Users> userManager,
            SignInManager<Users> signInManager,
            ITokenService tokenService,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _roleManager = roleManager;
        }

        public class RegisterModel
        {
            public string Username { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
        }

        public class LoginModel
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

        // Register User
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            var user = new Users { UserName = model.Username, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                // Ensure "User" role exists
                var roleExists = await _roleManager.RoleExistsAsync("User");
                if (!roleExists)
                {
                    await _roleManager.CreateAsync(new IdentityRole("User"));
                }

                // Add the user to the "User" role by default
                await _userManager.AddToRoleAsync(user, "User");

                return Ok(new { Message = "User registered successfully", User = new { model.Username, model.Email } });
            }

            return BadRequest(new { Errors = result.Errors.Select(e => e.Description).ToList() });
        }

        // Login User
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        
        
     {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null)
                return Unauthorized(new { Message = "Invalid credentials" });

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);

            if (result.Succeeded)
            {
                // Fetch roles for the user using Identity
                var roles = await _userManager.GetRolesAsync(user);

                // Generate JWT token (await the asynchronous method)
                var token = await _tokenService.GenerateJwtToken(user);

                // Return the token and role(s)
                return Ok(new
                {
                    Token = token,
                    ExpiresIn = 3600, // Token expires in 1 hour
                    Role = roles.FirstOrDefault() // Assuming one role per user (Admin or User)
                });
            }

            return Unauthorized(new { Message = "Invalid credentials" });
        }
    }
}
