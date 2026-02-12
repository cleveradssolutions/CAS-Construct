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

const SDK = globalThis.SDK;

const PLUGIN_CLASS = SDK.Plugins.CASAI_MobileAds;

PLUGIN_CLASS.Instance = class CASMobileAdsInstance extends SDK.IInstanceBase {
    constructor(sdkType: SDK.ITypeBase, inst: SDK.IObjectInstance) {
        super(sdkType, inst);
    }

    Release() {}

    OnCreate() {}

    OnPropertyChanged(id: string, value: EditorPropertyValueType) {
        switch (id) {
            case "ios-solutions":
            case "android-solutions":
                let solutions = (value as string).toLowerCase();
                if (solutions != "-") {
                    const mapped = solutions
                        .toLowerCase()
                        .split(/[,\s;]+/)
                        .map((s) => {
                            if (s.includes("opt")) return "Optimal";
                            if (s.includes("fam")) return "Families";
                            if (s.includes("tenj")) return "Tenjin";
                            return null;
                        })
                        .filter(Boolean);

                    this._inst.SetPropertyValue(id, mapped.length > 0 ? mapped.join(",") : "-");
                }
                break;
            case "android-use-ad-id":
                let useId = (value as string).toLowerCase();
                if (useId != "true" && useId != "false") {
                    if (useId.indexOf("true") >= 0) {
                        this._inst.SetPropertyValue(id, "true");
                    } else {
                        this._inst.SetPropertyValue(id, "false");
                    }
                }
                break;
        }
    }

    LoadC2Property(name: string, valueString: string) {
        return false; // not handled
    }
};

export {};
