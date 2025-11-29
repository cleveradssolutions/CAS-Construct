/*
 * Copyright 2025 CleverAdsSolutions LTD, CAS.AI
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const C3 = globalThis.C3;
C3.Plugins.CASAI_MobileAds.Exps = {
    /**
     * Initialization error or empty string if success.
     */
    InitializationError() {
        return this._initializationStatus?.error ?? "";
    },
    /**
     * User Country code ISO-2 or `--` if not allowed.
     */
    UserCountryCode() {
        return this._initializationStatus?.countryCode ?? "--";
    },
    /**
     * The current user consent status as a string, can take the values of:
     * 'Unknown', 'Obtained' 'Not required', 'Unavailable', 'Internal error', 'Network error', 'Invalid context', 'Still presenting';
     * In web exports this expression always return the Unknown value.
     */
    ConsentStatus() {
        return this._initializationStatus?.consentFlowStatus ?? "Unknown";
    },
    /**
     * When in a failure condition, an error message related to it.
     */
    ErrorMessage() {
        return this._errorMessage ?? "";
    },
};
export {};
