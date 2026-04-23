using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MediSyncAPI.Models
{
    [Table("Users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("Id")]
        public int Id { get; set; }
        
        [Required]
        [EmailAddress]
        [Column("Email")]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [Column("Password")]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        [Column("FirstName")]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(50)]
        [Column("LastName")]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [Column("Role")]
        public string Role { get; set; } = string.Empty; // Admin, Doctor, Receptionist
        
        [Column("CreatedAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}