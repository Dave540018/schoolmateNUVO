import os
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image

class PngToPdfConverterApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Modern PNG to PDF Converter")
        self.root.geometry("550x400")
        self.root.resizable(False, False)
        
        # Set a clean, modern look using TTK styles
        self.style = ttk.Style()
        self.theme = self.style.theme_use("clam")
        
        # Configure colors and padding
        self.style.configure("TLabel", font=("Segoe UI", 10))
        self.style.configure("TButton", font=("Segoe UI", 10, "bold"), background="#0078D4", foreground="white")
        self.style.map("TButton", background=[("active", "#005A9E")])
        self.style.configure("Action.TButton", background="#107C41", foreground="white")
        self.style.map("Action.TButton", background=[("active", "#0B5931")])
        
        # Dynamic variables to store user choices
        self.input_folder_path = tk.StringVar()
        self.output_pdf_path = tk.StringVar()
        self.quality_val = tk.IntVar(value=90)
        self.orientation_val = tk.StringVar(value="Force Portrait")
        
        self.create_widgets()

    def create_widgets(self):
        # Main container with padding
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Title
        title_label = ttk.Label(main_frame, text="PNG to PDF Optimizer", font=("Segoe UI", 16, "bold"), foreground="#333333")
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20), sticky="w")

        # 1. Input Folder Selection
        ttk.Label(main_frame, text="Input Folder:").grid(row=1, column=0, sticky="w", pady=5)
        self.input_entry = ttk.Entry(main_frame, textvariable=self.input_folder_path, width=40, state="readonly")
        self.input_entry.grid(row=1, column=1, padx=5, pady=5)
        ttk.Button(main_frame, text="Browse", command=self.browse_input_folder).grid(row=1, column=2, padx=5, pady=5)

        # 2. Output File Selection
        ttk.Label(main_frame, text="Output PDF:").grid(row=2, column=0, sticky="w", pady=5)
        self.output_entry = ttk.Entry(main_frame, textvariable=self.output_pdf_path, width=40, state="readonly")
        self.output_entry.grid(row=2, column=1, padx=5, pady=5)
        ttk.Button(main_frame, text="Save As", command=self.browse_output_pdf).grid(row=2, column=2, padx=5, pady=5)

        # 3. Dynamic Quality Slider
        ttk.Label(main_frame, text="Quality (1-100):").grid(row=3, column=0, sticky="w", pady=15)
        
        slider_frame = ttk.Frame(main_frame)
        slider_frame.grid(row=3, column=1, columnspan=2, sticky="we", pady=15)
        
        self.quality_scale = ttk.Scale(slider_frame, from_=1, to=100, variable=self.quality_val, command=self.update_quality_label)
        self.quality_scale.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        
        self.quality_label = ttk.Label(slider_frame, text="90 (Recommended)", font=("Segoe UI", 10, "bold"))
        self.quality_label.pack(side=tk.RIGHT)

        # 4. Orientation Options
        ttk.Label(main_frame, text="Orientation:").grid(row=4, column=0, sticky="w", pady=5)
        
        orientation_choices = ["Force Portrait", "Force Landscape", "Keep Original"]
        self.orientation_dropdown = ttk.Combobox(main_frame, textvariable=self.orientation_val, values=orientation_choices, state="readonly", width=20)
        self.orientation_dropdown.grid(row=4, column=1, sticky="w", padx=5, pady=5)

        # Separator line (Fixed line here)
        separator = ttk.Separator(main_frame, orient='horizontal')
        separator.grid(row=5, column=0, columnspan=3, sticky='ew', pady=20)

        # 5. Convert Button
        self.convert_btn = ttk.Button(main_frame, text="Convert & Merge Images", style="Action.TButton", command=self.convert_png_to_pdf)
        self.convert_btn.grid(row=6, column=0, columnspan=3, ipady=8, sticky="we")

    def browse_input_folder(self):
        folder = filedialog.askdirectory(title="Select Folder Containing PNG Images")
        if folder:
            self.input_folder_path.set(folder)

    def browse_output_pdf(self):
        file_path = filedialog.asksaveasfilename(
            title="Save PDF As",
            defaultextension=".pdf",
            filetypes=[("PDF Files", "*.pdf")]
        )
        if file_path:
            self.output_pdf_path.set(file_path)

    def update_quality_label(self, val):
        current_val = int(float(val))
        if current_val == 90:
            self.quality_label.config(text="90 (Recommended)")
        elif current_val > 90:
            self.quality_label.config(text=f"{current_val} (Maximum Size)")
        else:
            self.quality_label.config(text=f"{current_val} (High Reduction)")

    def convert_png_to_pdf(self):
        input_folder = self.input_folder_path.get()
        output_pdf = self.output_pdf_path.get()
        quality = self.quality_val.get()
        orientation = self.orientation_val.get()

        if not input_folder:
            messagebox.showwarning("Missing Input", "Please select an input folder containing your PNG files.")
            return
        if not output_pdf:
            messagebox.showwarning("Missing Output", "Please choose a destination and name for your output PDF file.")
            return

        try:
            files = [f for f in os.listdir(input_folder) if f.lower().endswith('.png')]
            files.sort()

            if not files:
                messagebox.showerror("No Images Found", "No PNG files were found in the selected folder.")
                return

            processed_images = []

            for file in files:
                img_path = os.path.join(input_folder, file)
                img = Image.open(img_path)

                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    img = img.convert('RGBA')
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])
                    img = background
                else:
                    img = img.convert('RGB')

                if orientation == "Force Portrait" and img.width > img.height:
                    img = img.rotate(90, expand=True)
                elif orientation == "Force Landscape" and img.height > img.width:
                    img = img.rotate(270, expand=True)

                processed_images.append(img)

            if processed_images:
                first_image = processed_images[0]
                remaining_images = processed_images[1:]

                first_image.save(
                    output_pdf,
                    save_all=True,
                    append_images=remaining_images,
                    optimize=True,
                    quality=quality
                )
                
                messagebox.showinfo("Success!", f"Successfully converted {len(processed_images)} images into a single optimized PDF.\n\nSaved to: {output_pdf}")

        except Exception as e:
            messagebox.showerror("Error", f"An error occurred during conversion:\n{str(e)}")

if __name__ == "__main__":
    root = tk.Tk()
    app = PngToPdfConverterApp(root)
    root.mainloop()