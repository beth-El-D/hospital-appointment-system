using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediSyncAPI.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAppointmentModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Appointments",
                keyColumn: "Id",
                keyValue: "1",
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 23, 9, 51, 40, 517, DateTimeKind.Utc).AddTicks(6896), new DateTime(2026, 4, 23, 9, 51, 40, 517, DateTimeKind.Utc).AddTicks(7060) });

            migrationBuilder.UpdateData(
                table: "Appointments",
                keyColumn: "Id",
                keyValue: "2",
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 23, 9, 51, 40, 517, DateTimeKind.Utc).AddTicks(7347), new DateTime(2026, 4, 23, 9, 51, 40, 517, DateTimeKind.Utc).AddTicks(7348) });

            migrationBuilder.UpdateData(
                table: "Appointments",
                keyColumn: "Id",
                keyValue: "3",
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 23, 9, 51, 40, 517, DateTimeKind.Utc).AddTicks(7358), new DateTime(2026, 4, 23, 9, 51, 40, 517, DateTimeKind.Utc).AddTicks(7359) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Appointments",
                keyColumn: "Id",
                keyValue: "1",
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 23, 9, 50, 56, 738, DateTimeKind.Utc).AddTicks(6191), new DateTime(2026, 4, 23, 9, 50, 56, 738, DateTimeKind.Utc).AddTicks(6433) });

            migrationBuilder.UpdateData(
                table: "Appointments",
                keyColumn: "Id",
                keyValue: "2",
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 23, 9, 50, 56, 738, DateTimeKind.Utc).AddTicks(6907), new DateTime(2026, 4, 23, 9, 50, 56, 738, DateTimeKind.Utc).AddTicks(6907) });

            migrationBuilder.UpdateData(
                table: "Appointments",
                keyColumn: "Id",
                keyValue: "3",
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 23, 9, 50, 56, 738, DateTimeKind.Utc).AddTicks(6914), new DateTime(2026, 4, 23, 9, 50, 56, 738, DateTimeKind.Utc).AddTicks(6914) });
        }
    }
}
