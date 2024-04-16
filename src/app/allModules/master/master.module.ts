import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    // tslint:disable-next-line:max-line-length
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatListModule, MatMenuModule, MatRadioModule, MatSidenavModule, MatToolbarModule,
    MatProgressSpinnerModule, MatTooltipModule, MatProgressBarModule, MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonToggleModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatDividerModule, MatExpansionModule, MatGridListModule, MatNativeDateModule, MatPaginatorModule, MatRippleModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatTableModule, MatSortModule, MatTabsModule, MatTreeModule
} from '@angular/material';
import { SelectAutocompleteModule } from 'mat-select-autocomplete';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule, FuseCountdownModule, FuseHighlightModule, FuseMaterialColorPickerModule, FuseWidgetModule } from '@fuse/components';
import { MenuAppComponent } from './menu-app/menu-app.component';
import { RoleComponent } from './role/role.component';
import { UserComponent } from './user/user.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RoleSideBarComponent } from './role/role-side-bar/role-side-bar.component';
import { RoleMainContentComponent } from './role/role-main-content/role-main-content.component';
import { MenuAppSideBarComponent } from './menu-app/menu-app-side-bar/menu-app-side-bar.component';
import { MenuAppMainContentComponent } from './menu-app/menu-app-main-content/menu-app-main-content.component';
import { ReasonComponent } from './reason/reason.component';
import { PlantComponent } from './plant/plant.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrganizationComponent } from './organization/organization.component';
import { DataMigrationComponent } from './data-migration/data-migration.component';
import { CustomerGroupComponent } from './usergroup/usergroup.component';
import { UserCreationErrorLogComponent } from './user/user-creation-error-log/user-creation-error-log.component';
import { SalesgroupComponent } from './salesgroup/salesgroup.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { LrUpdateComponent } from './lr-update/lr-update.component';
import { CfaMappingComponent } from './cfa-mapping/cfa-mapping.component';
import { LogAdminComponent } from './log-admin/log-admin.component';
import { FlashNotificationComponent } from './flash-notification/flash-notification.component';
import { combineAll } from 'rxjs/operators';
import { UserManualComponent } from './user-manual/user-manual.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { DeleteInvoiceComponent } from './delete-invoice/delete-invoice.component';
import { ReversePodApproversComponent } from './reverse-pod-approvers/reverse-pod-approvers.component';
import { ReversePodUpdateComponent } from './reverse-pod-update/reverse-pod-update.component';
import { UnlockUserComponent } from './unlock-user/unlock-user.component';

const menuRoutes: Routes = [
    {
        path: 'menuApp',
        component: MenuAppComponent,
    },
    {
        path: 'role',
        component: RoleComponent,
    },
    {
        path: 'user',
        component: UserComponent,
    },
    {
        path: 'organization',
        component: OrganizationComponent,
    },
    {
        path: 'plant',
        component: PlantComponent,
    },
    {
        path: 'reason',
        component: ReasonComponent,
    },
    {
        path: 'dataMigration',
        component: DataMigrationComponent,
    },
    {
        path: 'customergroup',
        component: CustomerGroupComponent
    },
    {
        path: 'salesgroup',
        component: SalesgroupComponent
    },
    {
        path: 'lr-update',
        component: LrUpdateComponent
    },
    {
        path: 'cfamap',
        component: CfaMappingComponent
    },
    {
        path: 'actionLog',
        component: LogAdminComponent
    },
    {
        path: 'notification',
        component: FlashNotificationComponent
    },
    {
        path: 'user-manual',
        component: UserManualComponent
    },
    {
        path: 'delete-invoice',
        component: DeleteInvoiceComponent
    },
    {
        path: 'rpod-approver',
        component: ReversePodApproversComponent
    },
    {
        path: 'rpod-update',
        component: ReversePodUpdateComponent
    },
    {
        path: 'unlock-user',
        component: UnlockUserComponent
    },

];
@NgModule({
    declarations: [
        UserComponent,
        RoleComponent,
        RoleSideBarComponent,
        RoleMainContentComponent,
        MenuAppComponent,
        MenuAppSideBarComponent,
        MenuAppMainContentComponent,
        ReasonComponent,
        PlantComponent,
        OrganizationComponent,
        DataMigrationComponent,
        CustomerGroupComponent,
        SalesgroupComponent,
        LrUpdateComponent,
        CfaMappingComponent,
        LogAdminComponent,
        FlashNotificationComponent,
        UserManualComponent,
        DeleteInvoiceComponent,
        ReversePodApproversComponent,
        ReversePodUpdateComponent,
        UnlockUserComponent
    ],
    imports: [
        RouterModule.forChild(menuRoutes),
        NgMultiSelectDropDownModule,
        AngularMultiSelectModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        InfiniteScrollModule,
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
        SelectAutocompleteModule,
        MatSnackBarModule,
        MatTableModule,
        MatSortModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,
        NgxChartsModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        FormsModule,
        ReactiveFormsModule,
        PdfViewerModule
    ],
    providers: [

    ]
})
export class MasterModule {
}

