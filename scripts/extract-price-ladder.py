"""Recover reviewed price observations from immutable exact-version catalogue facts.

This is an explicit field allow-list, not a scraper, estimator or sibling join.
All numeric values are copied unchanged; provenance points to the original row.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = 'data/catalogue-additions-2026-10-10.json'
data = json.loads((ROOT / SOURCE).read_text())
variants = {v['id']: v for v in data['variants']}
BEFORE, DRIVE = 'Before on-road costs', 'Driveaway'
rows, unresolved = [], []

def add(f, index, rung, tag, basis, **extra):
    row = {k: f[k] for k in ['variantId', 'value', 'sourceIds', 'date', 'qualifications']}
    row.update(sourceKey=f['key'], sourcePointer=f'{SOURCE}#/facts/{index}',
               originalBasis=f['basis'], rung=rung, basisTag=tag,
               comparisonBasis=basis, rankingEligible=bool(basis) and rung < 5)
    if f.get('validUntil'): row['validUntil'] = f['validUntil']
    row.update(extra)
    rows.append(row)

for i, f in enumerate(data['facts']):
    v = variants.get(f['variantId'])
    if not v or v.get('vehicle_class', 'passenger') not in ['passenger', 'ute']: continue
    key, value, vid = f['key'], f['value'], f['variantId']
    if key.startswith('source_state_driveaway_offer_') and isinstance(value, dict):
        # Every territory remains a separate candidate. The default is a labelled
        # NSW example, never a national claim or a minimum across states.
        add(f, i, 4, f"Maker’s {value['state']} driveaway from", DRIVE,
            value=value['amountAud'], state=value['state'],
            qualifications=f['qualifications'] + value.get('conditions', []) +
            ['Premium paint extra; no stated expiry, while stocks last.'])
        continue
    if key == 'source_price_exact_stock_price' and isinstance(value, dict):
        add(f, i, 6, 'Dealer ad · driveaway', DRIVE,
            value=value['amount'], qualifications=f['qualifications']+value.get('notes', []))
        continue
    if not isinstance(value, (int, float)) or isinstance(value, bool) or value <= 0: continue
    if key == 'configurator_rrp_aud':
        add(f, i, 3, 'Maker’s configurator · before on-road costs', BEFORE)
    elif key == 'price_from_aud_excluding_on_roads':
        add(f, i, 3, 'Maker’s from price · before on-road costs', BEFORE)
    elif key in ['example_driveaway_aud', 'official_driveaway_estimate_postcode2000']:
        add(f, i, 4, 'Maker’s NSW driveaway estimate', DRIVE, state='NSW')
    elif key == 'manufacturer_displayed_price_aud':
        add(f, i, 3, 'Maker’s configurator · on-road basis unconfirmed', '', rankingEligible=False)
    elif key == 'recommended_driveaway_aud' and vid.startswith('kgm_musso_ev'):
        add(f, i, 2, 'Maker’s national driveaway', DRIVE)
    elif key == 'source_catalogue_advertised_driveaway_aud' and vid.startswith('honda_'):
        add(f, i, 3, 'Maker’s advertised driveaway estimate', DRIVE)
    elif key == 'source_driveaway_from_aud' and vid.startswith('mazda_cx6e_'):
        add(f, i, 3, 'Maker’s driveaway from price', DRIVE,
            qualifications=f['qualifications']+['Premium paint extra; no published end date in the observed offer.'])
    elif key == 'manufacturer_campaign_driveaway_aud' and vid.startswith('volkswagen_idbuzz_'):
        add(f, i, 2, 'Maker’s national driveaway from', DRIVE, validFrom='2026-10-01', validUntil='2026-12-31')
    elif key.startswith('source_dealer_advertised_price_'):
        add(f, i, 6, 'Dealer ad · driveaway', DRIVE)
    elif key == 'msrp_aud' and vid.startswith('renault_scenic_'):
        add(f, i, 1, 'Maker’s list price · before on-road costs', BEFORE)
    elif key == 'msrp_aud' and vid.startswith('cadillac_lyriq_'):
        add(f, i, 1, 'Maker’s indicative MSRP · before on-road costs', BEFORE,
            conditionExplanation='Manufacturer announcement price is subject to final launch confirmation.')
    elif key == 'current_driveaway_campaign' and vid.startswith('cadillac_optiq_'):
        add(f, i, 2, 'Maker’s national driveaway offer', DRIVE)
    elif key == 'current_driveaway_campaign' and vid.startswith('hyundai_elexio_'):
        add(f, i, 4, 'Maker’s NSW driveaway offer', DRIVE, state='NSW',validFrom='2026-10-01',validUntil='2026-12-31')
    elif key == 'driveaway_price_aud':
        if 'Specific dealer advertisement' in f['basis']:
            add(f, i, 6, 'Dealer ad · driveaway', DRIVE)
        elif vid.startswith('kia_ev'):
            add(f, i, 4, 'Maker’s NSW driveaway estimate', DRIVE, state='NSW')
        elif vid.startswith('mg4_'):
            add(f, i, 2, 'Maker’s national driveaway offer', DRIVE,
                validFrom='2026-10-01')
        elif vid.startswith('byd_atto_1__essential'):
            add(f, i, 2, 'Maker’s national driveaway offer', DRIVE,validFrom='2026-09-15')
        elif vid.startswith('hyundai_ioniq_5_'):
            add(f, i, 4, 'Maker’s NSW driveaway offer', DRIVE,state='NSW')
        elif vid.startswith(('volkswagen_','skoda_')):
            add(f, i, 2, 'Maker’s national driveaway from', DRIVE)
    elif key == 'advertised_driveaway_aud':
        if vid.startswith('nissan_ariya_'):
            add(f, i, 2, 'Maker’s national driveaway offer', DRIVE,validFrom='2026-10-01')
        elif vid.startswith(('mg_mgs5_','im_im5_','im_im6_')):
            # The record explicitly limits this observed selector promotion to
            # October 2026; no cashback is subtracted a second time.
            add(f, i, 3, 'Maker’s configurator driveaway offer', DRIVE,
                validFrom='2026-10-01',validUntil='2026-10-31',
                qualifications=f['qualifications']+['Observed October 2026 promotional selector price; eligibility and location-specific quote require confirmation.'])
        elif vid.startswith(('mg_mgs6_','mg_cyberster_')):
            # The field's old label alone does not establish what taxes it includes.
            add(f, i, 3, 'Maker’s configurator · on-road basis unconfirmed', '',rankingEligible=False)
        elif vid.startswith('deepal_s07_'):
            add(f, i, 3, 'Maker’s driveaway from · 20-inch wheels', DRIVE)
        elif vid.startswith('zeekr_x_'):
            unresolved.append({'variantId':vid,'sourceKey':key,'reason':'Campaign terms and eligibility were not captured; a current exact-version offer cannot be validated.'})
        elif vid.startswith('kgm_torres_'):
            unresolved.append({'variantId':vid,'sourceKey':key,'reason':'Campaign expiry is unconfirmed and metallic-paint inclusion conflicts between offer card and footer.'})
    elif key == 'source_ora5_advertised_driveaway_from':
        unresolved.append({'variantId':vid,'sourceKey':key,'reason':'Offer footer expired 30 September; observation on 10 October does not establish a renewed October offer.'})
    elif key in ['launch_msrp_aud','driveaway_launch_price_aud','source_launch_msrp_from']:
        unresolved.append({'variantId':vid,'sourceKey':key,'reason':'Historical launch observation; exact current configuration applicability or supersession remains unresolved.'})

# Exact new-vehicle dealer observations are lower-rung evidence, never maker MSRP.
source_ids = {s['id'] for s in data['sources']}
def dealer_candidate(filename, pointer, raw, variant_id, amount_key, source_id, date, notes, basis=DRIVE):
    assert variant_id in variants, variant_id
    matches = [s for s in source_ids if s == source_id or s.endswith('_'+source_id)]
    assert len(matches) == 1, (source_id, matches)
    rows.append(dict(variantId=variant_id, value=raw[amount_key], sourceIds=matches,
                     sourceKey='dealer_'+source_id, sourcePointer=f'data/{filename}#/{pointer}/{amount_key}',
                     originalBasis=raw.get('price_basis',raw.get('priceType',raw.get('basis','Dealer advertised price'))),
                     date=date,rung=6,basisTag='Dealer ad · driveaway' if basis else 'Dealer ad · on-road basis unconfirmed',
                     comparisonBasis=basis,rankingEligible=False, qualifications=notes+[
                         'Exact advertised New unit; advertised price does not establish physical stock, an accepted order or a final quote.']))

filename='geely-zeekr-xpeng-evidence.json'
packet=json.loads((ROOT/'data'/filename).read_text())
for index, variant_id in {
  3:'zeekr_x_my26__awd__20261010',
  4:'zeekr_009_116__7_seat_fwd__20261010',
  5:'zeekr_009_116__6_seat_awd__20261010',
}.items():
    raw=packet['exact_new_stock_evidence'][index]
    dealer_candidate(filename,f'exact_new_stock_evidence/{index}',raw,variant_id,'advertised_price_aud',raw['source_id'],raw['observed_on'],[raw['configuration_label']+'; stock '+raw['stock_number']])
filename='deepal-evidence.json'
packet=json.loads((ROOT/'data'/filename).read_text())
for index,variant_id in {1:'deepal_e07_current__awd_performance__20261010',2:'deepal_e07_current__rwd__20261010'}.items():
    raw=packet['specificNewStock'][index]
    dealer_candidate(filename,f'specificNewStock/{index}',raw,variant_id,'priceAUD',raw['sourceId'],raw['evidence'][0]['checkedOn'],[raw['configuration']+'; '+raw['dealer']+'; '+raw['location']+'; stock '+raw['stockNumber'],raw['note']])
filename='vw-skoda-cupra-evidence-2026-10-10.json'
packet=json.loads((ROOT/'data'/filename).read_text())
for index,variant_id in {6:'skoda_enyaq_suv_my27__select_60__20261010',7:'skoda_enyaq_suv_my27__sportline_85__20261010'}.items():
    raw=packet['records'][index]['pricing']['advertised_new_price_aud']
    dealer_candidate(filename,f'records/{index}/pricing/advertised_new_price_aud',raw,variant_id,'value',raw['source_ids'][0],raw['checked_on'],[raw['qualifier'],'Manufacturer campaign prices disagree across current pages; this is a separately attributed dealer advertisement, not resolution of that conflict.'])
filename='omoda-jaecoo-evidence.json'
packet=json.loads((ROOT/'data'/filename).read_text())
raw=packet['stockEvidence'][2]
dealer_candidate(filename,'stockEvidence/2',raw,'chery_e5_my26__ultimate_fwd_my26__20261010','askingPriceAUD',raw['id'],raw['evidence']['checkedAt'],[raw['title']+'; '+raw['dealer']+'; stock '+raw['stockNo']]+raw['notes'])

out = {'schemaVersion':1,'policyDate':'2026-10-13','scope':'Existing Tier 1 exact-version facts only. Re-admission does not re-date sources or certify a delivered build.',
       'selection':'Highest admissible rung. Same-rung state examples prefer NSW, then alphabetical state; never select the cheapest state. No arithmetic or sibling inheritance.',
       'candidates':rows,'unresolved':unresolved}
path=ROOT/'data/price-ladder-existing-candidates-2026-10-13.json'
path.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
print(f'{len(rows)} candidate observations covering {len({r["variantId"] for r in rows})} versions; {len(unresolved)} deferred observations')
