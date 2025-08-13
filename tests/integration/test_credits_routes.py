import pytest


@pytest.mark.integration
@pytest.mark.credits
class TestCreditsRoutes:
    def test_get_balance(self, client, auth_headers):
        resp = client.get('/api/credits/balance', headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['credits'] == 10

    def test_purchase_credits(self, client, auth_headers):
        resp = client.post('/api/credits/purchase', json={'amount': 50}, headers=auth_headers)
        assert resp.status_code == 200
        data = resp.get_json()
        assert data['new_balance'] == 60
