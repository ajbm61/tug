<!--
This file is part of the Tug package.

(c) François Pluchino <francois.pluchino@gmail.com>

For the full copyright and license information, please view the LICENSE
file that was distributed with this source code.
-->

<template>
    <v-fade-transition mode="out-in">
        <loading v-if="!disableFirstLoading && firstLoading" class="mt-5"></loading>

        <wall-message v-else-if="!disableFirstLoading && wallEmptyMessage && hasNoItems">
            <template v-for="(slotItem) in getSlotItems('no-items')" v-slot:[slotItem.target]>
                <slot :name="slotItem.original"></slot>
            </template>
        </wall-message>

        <div v-else>
            <v-row class="ma-0" align="center">
                <v-col cols="6" md="8" lg="10" class="ma-0 pa-0">
                    <slot name="header"
                          :headers="headers"
                          :items="items"
                          :count="count"
                          :total="total"
                          :lastId="lastId"
                          :search="search"
                    ></slot>
                </v-col>
                <v-col cols="6" md="4" lg="2" class="search-list__actions">
                    <slot name="header-actions"
                          :headers="headers"
                          :items="items"
                          :count="count"
                          :total="total"
                          :lastId="lastId"
                          :search="search"
                    ></slot>

                    <v-btn :color="$color('primary', 'primary lighten-2')"
                           depressed
                           ripple
                           rounded
                           small
                           :loading="loading"
                           @click="refresh()"
                    >
                        <v-icon small>refresh</v-icon>
                    </v-btn>
                </v-col>
            </v-row>

            <v-card flat>
                <v-data-table
                        :headers="headers"
                        :items="items"
                        :loading="loading"
                        hide-default-footer
                        disable-sort
                        disable-filtering
                        disable-pagination
                        item-key="id">

                    <template v-for="(slotItem) in getSlotItems('data-table')"
                              v-slot:[slotItem.target]="{
                                expand,
                                group,
                                groupBy,
                                groupedItems,
                                header,
                                headers,
                                index,
                                isExpanded,
                                isMobile,
                                isOpen,
                                isSelected,
                                item,
                                items,
                                itemsLength,
                                on,
                                options,
                                pageStart,
                                pageStop,
                                pagination,
                                props,
                                remove,
                                select,
                                sort,
                                toggle,
                                updateOptions,
                                value,
                                widths,
                              }"
                    >
                        <slot :name="slotItem.original"
                              :expand="expand"
                              :group="group"
                              :groupBy="groupBy"
                              :groupedItems="groupedItems"
                              :header="header"
                              :headers="headers"
                              :index="index"
                              :isExpanded="isExpanded"
                              :isMobile="isMobile"
                              :isOpen="isOpen"
                              :isSelected="isSelected"
                              :item="item"
                              :items="items"
                              :itemsLength="itemsLength"
                              :on="on"
                              :options="options"
                              :pageStart="pageStart"
                              :pageStop="pageStop"
                              :pagination="pagination"
                              :props="props"
                              :remove="remove"
                              :select="select"
                              :sort="sort"
                              :toggle="toggle"
                              :updateOptions="updateOptions"
                              :value="value"
                              :widths="widths"
                        ></slot>
                    </template>

                    <template slot="footer">
                        <v-container>
                            <v-row justify="center">
                                <v-scale-transition mode="out-in">
                                    <v-btn v-if="lastId !== null"
                                           color="accent"
                                           depressed
                                           rounded
                                           small
                                           ripple
                                           :loading="loading"
                                           @click="fetchData(search)"
                                    >
                                        {{ $t('pagination.load-more') }}
                                    </v-btn>

                                    <v-chip outlined small v-else-if="count > 0">
                                        {{ $t('pagination.all-loaded') }}
                                    </v-chip>
                                </v-scale-transition>
                            </v-row>
                        </v-container>
                    </template>
                </v-data-table>
            </v-card>
        </div>
    </v-fade-transition>
</template>

<script lang="ts">
    import {Component, Prop, Watch} from 'vue-property-decorator';
    import {mixins} from 'vue-class-component';
    import {AjaxListContent} from '@app/mixins/AjaxListContent';
    import Loading from '@app/components/Loading.vue';
    import WallMessage from '@app/components/WallMessage.vue';
    import Lottie from '@app/components/Lottie.vue';
    import {ListResponse} from '@app/api/models/responses/ListResponse';
    import {FetchRequestDataEvent} from '@app/events/requests/FetchRequestDataEvent';
    import {FetchRequestDataFunction} from '@app/events/requests/FetchRequestDataFunction';
    import {SlotWrapper} from '@app/mixins/SlotWrapper';

    /**
     * @author François Pluchino <francois.pluchino@gmail.com>
     */
    @Component({
        components: {Lottie, WallMessage, Loading},
    })
    export default class SearchList extends mixins(AjaxListContent, SlotWrapper) {
        @Prop({type: Function, required: true})
        public fetchRequest: FetchRequestDataFunction;

        @Prop({type: Boolean, default: true})
        public wallEmptyMessage: boolean;

        @Prop({type: Boolean, default: false})
        public disableFirstLoading: boolean;

        public async created(): Promise<void> {
            this.headers = this.$attrs.headers as any ?? [];

            await this.fetchData();
        }

        public mounted(): void {
            this.$root.$on('toolbar-search-out', async (searchValue: string|null) => {
                this.search = null !== searchValue ? searchValue.trim() : '';
            });

            this.$root.$on('search-list-delete-item', async (value: string|number, key: string = 'id') => {
                this.deleteItem(value, key);
            });

            this.$root.$emit('toolbar-search-refresh');
        }

        public destroyed() {
            this.$root.$off('toolbar-search-out');
            this.$root.$off('search-list-delete-item');
        }

        @Watch('search')
        public async searchRequest(searchValue?: string): Promise<void> {
            this.$root.$emit('toolbar-search-in', searchValue);
            await this.fetchData(searchValue);
        }

        public async fetchDataRequest(searchValue?: string): Promise<ListResponse<object>> {
            const event = new FetchRequestDataEvent();
            event.lastId = this.lastId;
            event.search = searchValue ? searchValue : null;
            event.canceler = this.previousRequest;

            const res = await this.fetchRequest(event);
            this.loading = false;

            return res;
        }
    }
</script>
