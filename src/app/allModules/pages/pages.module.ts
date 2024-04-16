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
import { DashboardComponent } from './dashboard/dashboard.component';
import { InvoiceItemComponent } from './invoice-item/invoice-item.component';
import { DecimalPipe } from '@angular/common';
import { InvoiceDetailsComponent } from './invoice-details/invoice-details.component';
import { SavedInvoiceComponent } from './saved-invoice/saved-invoice.component';
import { PartiallyConfirmedInvoiceComponent } from './partially-confirmed-invoice/partially-confirmed-invoice.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { SearchableMultiSelectComponent } from 'app/CustomControls/searchable-multi-select/searchable-multi-select.component';
import { SearchableSelectModule } from 'app/CustomControls/searchable-multi-select/searchable.module';
import { ReverseLogisticsComponent } from './reverse-logistics/reverse-logistics.component';
import { DeliveryChallansComponent } from './delivery-challans/delivery-challans.component';
import { HomeComponent } from './home/home.component';
import { ReverseLogisticsItemComponent } from './reverse-logistics-item/reverse-logistics-item.component';
const routes = [
    {
        path: 'forwardLogistics',
        component: DashboardComponent
    },
    {
        path: 'invoices',
        component: InvoiceDetailsComponent
    },
    {
        path: 'invItem',
        component: InvoiceItemComponent
    },
    {
        path: 'savedinvoice',
        component: SavedInvoiceComponent
    },
    {
        path: 'partialinvoice',
        component: PartiallyConfirmedInvoiceComponent
    },
    {
        path: 'reverseLogistics',
        component: ReverseLogisticsComponent
    },
    {
        path: 'deliverychallan',
        component: DeliveryChallansComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path:'reverseLogisticsItem',
        component:ReverseLogisticsItemComponent
    },
    // {
    //     path     : 'courses',
    //     component: AcademyCoursesComponent,
    //     resolve  : {
    //         academy: AcademyCoursesService
    //     }
    // },
    // {
    //     path     : 'courses/:courseId/:courseSlug',
    //     component: AcademyCourseComponent,
    //     resolve  : {
    //         academy: AcademyCourseService
    //     }
    // },
    {
        path: '**',
        redirectTo: '/auth/login'

    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        // HttpClientModule,
        // TranslateModule,
        NgMultiSelectDropDownModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
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
        MatTableModule,
        MatSortModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,

        // NgxChartsModule,
        // NgxDonutChartModule,
        FuseSharedModule,
        FuseSidebarModule,

        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        ChartsModule,
        SearchableSelectModule,
        FormsModule
    ],
    declarations: [DashboardComponent, InvoiceItemComponent, InvoiceDetailsComponent,
        SavedInvoiceComponent, PartiallyConfirmedInvoiceComponent, ReverseLogisticsComponent, DeliveryChallansComponent, HomeComponent, ReverseLogisticsItemComponent],
    providers: [
        DecimalPipe
    ],
    entryComponents: []
})
export class PagesModule { }
