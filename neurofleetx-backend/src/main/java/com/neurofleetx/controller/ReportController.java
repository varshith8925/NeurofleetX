package com.neurofleetx.controller;


import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.ByteArrayOutputStream;

import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import com.neurofleetx.dto.StatsDTO;
import com.neurofleetx.service.BookingService;
import com.neurofleetx.service.VehicleService;
import com.neurofleetx.service.UserService;

@RestController
@RequestMapping("/api/reports")

public class ReportController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private UserService userService;

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<ByteArrayResource> downloadReportPdf() {
        try {
            // Fetch stats from services
            StatsDTO bookingStats = bookingService.getBookingStats().getData();
            StatsDTO vehicleStats = vehicleService.getVehicleStats().getData();
            StatsDTO userStats = userService.getUserStats().getData();

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("NeuroFleetX - Fleet Report"));
            document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now()));
            document.add(new Paragraph("\n"));

            // Summary Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(60);
            table.addCell("Metric");
            table.addCell("Value");

            table.addCell("Total Trips");
            table.addCell(String.valueOf(bookingStats.getTotalTrips()));
            table.addCell("Total Revenue");
            table.addCell("₹" + String.format("%.2f", bookingStats.getTotalRevenue()));
            table.addCell("Total Distance");
            table.addCell(String.valueOf(bookingStats.getTotalDistance()) + " km");
            table.addCell("Active Trips");
            table.addCell(String.valueOf(bookingStats.getActive()));
            table.addCell("Total Vehicles");
            table.addCell(String.valueOf(vehicleStats.getTotal()));
            table.addCell("Available Vehicles");
            table.addCell(String.valueOf(vehicleStats.getAvailable()));
            table.addCell("Vehicles In Use");
            table.addCell(String.valueOf(vehicleStats.getInUse()));
            table.addCell("Vehicles in Maintenance");
            table.addCell(String.valueOf(vehicleStats.getMaintenance()));
            table.addCell("Drivers");
            table.addCell(String.valueOf(userStats.getDrivers()));
            table.addCell("Managers");
            table.addCell(String.valueOf(userStats.getManagers()));
            table.addCell("Customers");
            table.addCell(String.valueOf(userStats.getCustomers()));

            document.add(table);

            document.close();

            byte[] pdfBytes = out.toByteArray();
            ByteArrayResource resource = new ByteArrayResource(pdfBytes);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=report.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}