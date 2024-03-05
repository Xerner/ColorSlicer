import { Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DisplayCanvasComponent } from './display-canvas/display-canvas.component';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';
import { AppStoreService } from '../../services/app.store.service';
import { FileService } from '../../services/file.service';
import { ImageService } from '../../services/image.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSliderModule } from '@angular/material/slider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { KmeansImage } from '../../models/processedImage';

@Component({
  selector: 'app-display-page',
  standalone: true,
  templateUrl: './display-page.component.html',
  styleUrls: ['./display-page.component.scss'],
  imports: [
    MatIconModule, 
    DisplayCanvasComponent, 
    MatToolbarModule,
    MatSliderModule, 
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class DisplayPageComponent {
  hasImageData = computed<boolean>(() => {
    return this.storeService.rawImageFile() != null;
  });
  sliderValue = computed<number>(() => {
    return this.sliderRawValue() * this.sliderMultiplier();
  });
  sliderRawValue = signal<number>(1);
  sliderMultiplier = signal<number>(1);

  constructor(
    protected storeService: AppStoreService,
    protected imageService: ImageService,
    protected fileService: FileService,
  ) {}

  ngOnInit() {
    this.storeService.reset.subscribe(this.onReset.bind(this));
    this.storeService.kmeansImage.subscribe(this.onKmeansImagesCreated.bind(this));
  }

  onRawImageCanvasContextReady(context: CanvasRenderingContext2D | null) {
    if (context == null) {
      return;
    }
    this.storeService.rawImageContext2D.next(context)
  }

  onKmeansImageCanvasContextReady(context: CanvasRenderingContext2D | null) {
    if (context == null) {
      return;
    }
    this.storeService.kmeansImageContext2D.next(context)
  }

  protected onSliderChange(value: number) {
    this.sliderRawValue.set(value);
  }

  protected onSliderMultiplierChange(event: Event) {
    var value = (event.target as HTMLInputElement).value;
    this.sliderMultiplier.set(parseFloat(value));
  }

  protected onReset() {
    this.sliderRawValue.set(1);
    this.sliderMultiplier.set(1);
  }

  protected formatSliderLabel(value: number) {
    return `${(value * 100).toFixed(0)}%`;
  }

  onKmeansImagesCreated(kmeansImage: KmeansImage | null) {
    if (kmeansImage == null) {
      return;
    }
    kmeansImage.imagesLoaded$.subscribe(() => {
      var kmeansImage = this.storeService.kmeansImage.getValue();
      var labeledColorsImage = kmeansImage?.labeledColorsImage.getValue();
    });
  }
}
