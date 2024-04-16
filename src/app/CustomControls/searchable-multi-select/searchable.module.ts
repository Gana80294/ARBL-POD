import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';

import {
    MatFormFieldModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule
} from '@angular/material';

// import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
    FuseCountdownModule,
    FuseHighlightModule,
    FuseMaterialColorPickerModule,
    FuseWidgetModule
} from '@fuse/components';
import { ChartsModule } from "ng2-charts";
import 'chart.js';
import "chartjs-plugin-labels";
import "chartjs-plugin-annotation";
import { FuseSharedModule } from '@fuse/shared.module';
import { FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SearchableMultiSelectComponent } from 'app/CustomControls/searchable-multi-select/searchable-multi-select.component';
import { CustomControlsPlantComponent } from '../custom-controls-plant/custom-controls-plant.component';
import { DivisionControlComponent } from '../division-control/division-control.component';
import { OrganizationControlComponent } from '../organization-control/organization-control.component';
import { StatusControlsComponent } from '../status-controls/status-controls.component';
import { CustomControlsPlantGroupComponent } from '../custom-controls-plant-group/custom-controls-plant-group.component';


@NgModule({
    imports: [
        
        NgMultiSelectDropDownModule,
        MatFormFieldModule,
        
        
        MatInputModule,
        MatListModule,
        
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        
        

        // NgxChartsModule,
        // NgxDonutChartModule,
        FuseSharedModule,
        FuseSidebarModule,

        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        ChartsModule,
        FormsModule
    ],
    declarations: [
        SearchableMultiSelectComponent,
        CustomControlsPlantComponent,
        DivisionControlComponent,
        OrganizationControlComponent,
        StatusControlsComponent,
        CustomControlsPlantGroupComponent
    ],
    providers: [
     
    ],
    exports: [
        SearchableMultiSelectComponent,
        CustomControlsPlantComponent,
        DivisionControlComponent,
        OrganizationControlComponent,
        StatusControlsComponent,
        CustomControlsPlantGroupComponent
    ],
    entryComponents: []
})



export class SearchableSelectModule{}